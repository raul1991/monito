import os

from flask import Flask, render_template, request, Response, session, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from flask import abort
from flask import json

# Getting absolute path for directory, __file__ = module's name (app.py)
projectDir = os.path.dirname(os.path.abspath(__file__))

# Path for database in app's directory
databaseFile = "sqlite:///{}".format(os.path.join(projectDir, "Monito.db"))

# constants
UNALLOCATED = '-'

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = databaseFile
app.config["SECRET_KEY"] = os.urandom(24)
app.config["PERMANENT_SESSION_LIFETIME"] = 900  # seconds
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column('userID', db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    username = db.Column(db.String(20), unique=True)
    vdaIP = db.Column(db.String(15), unique=True)
    hostname = db.Column(db.String(50), unique=True)

    def __repr__(self):
        return ("<Name: {}>".format(self.name) +
                "<Username: {}>".format(self.username) +
                "<VDA-IP: {}>".format(self.vdaIP))


class Machine(db.Model):
    id = db.Column('machineID', db.Integer, primary_key=True)
    IP = db.Column(db.String(15), unique=True)
    vdaIPs = db.Column(db.String(200))
    owner = db.Column(db.String(10))
    notes = db.Column(db.String(200), default=' ')
    is_allocated = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return (
                "<Machine IP: {}".format(self.IP) + " VDA-IPs: {}".format(self.vdaIPs) + " Owner: {}>".format(
            self.owner)
                + " Notes: {}>".format(self.notes)) + " is_allocated: {}>".format(self.is_allocated)


@app.route('/machines/<ip>', methods=["PUT"])
def update_machine_info(ip):
    if request.form:
        notes = request.form.get('data')
        if notes:
            machine = Machine.query.filter_by(IP=ip).first()
            if machine:
                machine.notes = '@' + session['name'] + '-' + notes
                db.session.commit()
                return machine.IP + 'has notes = ' + machine.notes
            else:
                return abort(404, "Machine " + machine.IP + " not found")
        else:
            return abort(400, "Missing parameters")
    else:
        return abort(400, "Missing parameters")


@app.route('/', methods=["GET", "POST"])
def login():
    users = User.query.all()
    session.clear()

    if request.form:
        userName = request.form.get('username').lower()

        for user in users:
            if user.username == userName:
                session['user_name'] = user.username
                session['user_id'] = user.id;
                return redirect('/dashboard')

        return render_template('login.html', SERVER_ERROR='Oops! Incorrect username.')

    return render_template('login.html')


@app.route('/register', methods=["GET", "POST"])
def register():
    users = User.query.all()
    userExists = False

    if request.form:

        user = User(name=request.form.get('user_name').strip().lower(),
                    username=request.form.get('username').strip().lower(),
                    vdaIP=request.form.get('user_vda-ip').strip(),
                    hostname=request.form.get('user_hostname').strip().lower())

        for elem in users:
            if elem.username == user.username or elem.vdaIP == user.vdaIP or elem.hostname == user.hostname:
                userExists = True
                break

        if not userExists:
            db.session.add(user)
            db.session.commit()

            return redirect('/')

        return render_template('register.html', SERVER_ERROR='User already exists!')

    return render_template('register.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/dashboard')
def dashboard():
    if isUserLoggedIn():
        username = session['user_name']
        curr_user = User.query.filter_by(username=username).first()
        session['name'] = curr_user.name
        return render_template('dashboard.html', currentUser=curr_user)
    else:
        return redirect('/')


@app.route('/mapping', methods=["POST"])
def mapping():
    if request.form:
        machine = Machine(vdaIPs=request.form.get('vda_ips'),
                          IP=request.form.get('machine_ip'),
                          owner=request.form.get('owner').lower())
        dbMachine = Machine.query.filter_by(IP=machine.IP).first()

        if dbMachine:
            dbMachine.vdaIPs = machine.vdaIPs
            db.session.commit()
            return 'Updated Machine'
        else:
            db.session.add(machine)
            db.session.commit()
            return 'Added Machine'


@app.route('/allocate/<machine_ip>', methods=["PUT"])
def allocate(machine_ip):
    if request.form:
        db_machine = Machine.query.filter_by(IP=machine_ip).filter_by(is_allocated=False).first()
        if db_machine:
            # make the currently logged user as the owner of this machine.
            db_machine.owner = session['name']
            db_machine.is_allocated = True
            db.session.commit()
            return 'Updated'
        else:
            print("inside else")
            # return 404 because machine does not exists.
            return Response({'msg': "Action could not be completed"}, status=404)


@app.route('/release/<machine_ip>', methods=["PUT"])
def release(machine_ip):
    if request.form:
        db_machine = Machine.query.filter_by(IP=machine_ip).filter_by(is_allocated=True).first()
        if db_machine and db_machine.owner == session['name']:
            # it's a legit de-allocation.
            db_machine.owner = UNALLOCATED
            db_machine.is_allocated = False
            db_machine.notes = ''
            db.session.commit()
            return 'Updated'
        else:
            # return 404 because machine does not exists.
            return Response({'msg': "Action could not be completed"}, status=404,
                            mimetype={'Content-Type': 'application/json'})


def get_actions(owner):
    if owner == UNALLOCATED:
        return "Assign to me"
    return "release"


@app.route('/mappings')
def mappings():
    machines = Machine.query.all()
    response = []
    for machine in machines:
        vdaIPs = machine.vdaIPs.split(',')
        vdaNameMap = ''
        machine_obj = {}
        for IP in vdaIPs:
            userByVDA = User.query.filter_by(vdaIP=IP).first()
            userByHost = User.query.filter(User.hostname.ilike(IP.split(".")[0] + "%")).first()
            if userByVDA:
                vdaNameMap += userByVDA.name + ','
            elif userByHost:
                vdaNameMap += userByHost.name + ','
            else:
                vdaNameMap += IP.lower() + ','
            machine_obj = {
                'machine': machine.IP,
                'owner': machine.owner,
                'users': vdaNameMap[:-1],
                'notes': machine.notes,
                'actions': get_actions(machine.owner),
                'isAllocated': machine.is_allocated
            }
        response.append(machine_obj)

    return json.dumps(response)


# @app.route('/update', methods = ["POST"])
# def update():
# 	if request.form:
# 		machine = Machine(vdaIPs = request.form.get('vda_ips'), 
# 				IP = request.form.get('machine_ip'))

# 		db.session.add(machine)
# 		db.session.commit()

# 		return "Added Machine and Users"


def isUserLoggedIn():
    try:
        return session['user_name'] != None
    except:
        return False


@app.context_processor
def inject_basic_information():
    return dict(author="supremeanitabawa@gmail.com")


if __name__ == "__main__":
    db.create_all()
    app.run(host="0.0.0.0")
