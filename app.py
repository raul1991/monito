import os
from subprocess import Popen

from flask import Flask, render_template, request, Response, session, redirect
from flask import json
from flask_sqlalchemy import SQLAlchemy

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


class Users(db.Model):
    id = db.Column('userID', db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    email = db.Column(db.String(100))
    username = db.Column(db.String(20), unique=True)
    vdaIP = db.Column(db.String(15), unique=True)
    hostname = db.Column(db.String(50), unique=True)

    def __repr__(self):
        return ("<Name: {}>".format(self.name) +
                "<Username: {}>".format(self.username) +
                "<Email: {}>".format(self.email) +
                "<VDA-IP: {}>".format(self.vdaIP))


class Machine(db.Model):
    id = db.Column('machineID', db.Integer, primary_key=True)
    IP = db.Column(db.String(15), unique=True)
    active_users = db.Column(db.String(200))
    owner = db.Column(db.String(10))
    is_allocated = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return (
            "<Machine IP: {}".format(self.IP) + " VDA-IPs: {}".format(self.active_users) + " Owner: {}>".format(
                self.owner) + " is_allocated: {}>".format(self.is_allocated))


@app.route('/', methods=["GET", "POST"])
def login():
    users = Users.query.all()
    session.clear()

    if request.form:
        userName = request.form.get('username')

        for user in users:
            if user.username == userName:
                session['user_name'] = user.username
                session['user_id'] = user.id
                return redirect('/dashboard')

        return render_template('login.html', SERVER_ERROR='Oops! username \'{}\' does not exists.'.format(userName))

    return render_template('login.html')


@app.route('/register', methods=["GET", "POST"])
def register():
    users = Users.query.all()
    userExists = False

    if request.form:

        user = Users(name=request.form.get('user_name').strip().lower(),
                     username=request.form.get('username').strip().lower(),
                     email=request.form.get('email').strip().lower(),
                     vdaIP=request.form.get('user_vda-ip').strip(),
                     hostname=request.form.get('user_hostname').strip().lower())

        for elem in users:
            if elem.email == user.email or elem.username == user.username or elem.vdaIP == user.vdaIP or elem.hostname == user.hostname:
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
    if is_user_logged_in():
        username = session['user_name']
        curr_user = Users.query.filter_by(username=username).first()
        session['name'] = curr_user.name
        return render_template('dashboard.html', currentUser=curr_user)
    else:
        return redirect('/')


def is_trespassed(active_users, owner):
    print(active_users)
    print(owner)
    allowed_count = 0
    for u in active_users:
        if owner in str(u):
            allowed_count = allowed_count + 1  # for the owner
            break

        else:
            print("Not matched")
    return "-" not in active_users and len(active_users) > allowed_count


def is_machine_free(machine):
    return machine.owner == '-'


def get_user_email(owner):
    db_user = Users.query.filter_by(name=owner).first()
    if db_user:
        return db_user.email
    return None


def get_all_emails(machine, curr_user_email):
    all_users = Users.query.all()
    emails = []
    for user in all_users:
        if user.email != curr_user_email:
            emails.append(user.email)
    return ",".join(emails)


def convert_to_list(users):
    delimiter_exists = "," in users
    if delimiter_exists:
        return map(lambda s: s.strip(), users.split(","))
    return [users.strip()]


def send_mail_if_unauthorized_access(machine, owner_vdaIP):
    users = convert_to_list(machine.active_users)
    if not is_machine_free(machine) and is_trespassed(users, owner_vdaIP):
        email = get_user_email(machine.owner)
        print("Email sending for unauthorized_access has been disabled to avoid flooding")
        #send_email(email, machine, "unauthorized_access_mail.txt", "Unauthorized access")


def send_email(email, machine, template_name, reason):
    if email:
        capitalized_owner = machine.owner[0].upper() + machine.owner[1:]
        print("Sending an email for {0} to {1}".format(reason, email))
        Popen(["./send_mail.sh", "email_templates/" + template_name,
               capitalized_owner, machine.IP, machine.active_users, email])
    else:
        print("Email for {0} not found".format(machine.owner))


@app.route('/mapping', methods=["POST"])
def mapping():
    if request.form:
        ip = request.form.get('machine_ip')
        active_users = request.form.get('vda_ips')
        machine = Machine(active_users=active_users,
                          IP=ip,
                          owner=request.form.get('owner').lower())
        db_machine = Machine.query.filter_by(IP=machine.IP).first()

        if db_machine:
            curr_owner = Users.query.filter_by(name=db_machine.owner).first()
            if curr_owner:
                db_machine.active_users = active_users
                db.session.commit()
                send_mail_if_unauthorized_access(
                    db_machine, curr_owner.hostname)
            return 'Updated Machine'
        else:
            db.session.add(machine)
            db.session.commit()
            return 'Added Machine'


@app.route('/allocate/<machine_ip>', methods=["PUT"])
def allocate(machine_ip):
    if request.form:
        db_machine = Machine.query.filter_by(
            IP=machine_ip).filter_by(is_allocated=False).first()
        if db_machine:
            # make the currently logged user as the owner of this machine.
            db_machine.owner = session['name']
            db_machine.is_allocated = True
            db.session.commit()
            send_email(get_all_emails(db_machine, get_user_email(db_machine.owner)),
                       db_machine, "machine_status_change_mail.txt", "Machine status")
            return 'Updated'
        else:
            return Response({'msg': "Action could not be completed"}, status=404)


@app.route('/release/<machine_ip>', methods=["PUT"])
def release(machine_ip):
    if request.form:
        db_machine = Machine.query.filter_by(
            IP=machine_ip).filter_by(is_allocated=True).first()
        if db_machine and db_machine.owner == session['name']:
            # it's a legit de-allocation.
            db_machine.owner = UNALLOCATED
            db_machine.is_allocated = False
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
        active_user_machine_names = machine.active_users.split(',')
        active_users = ''
        machine_obj = {}
        for IP in active_user_machine_names:
            userByVDA = Users.query.filter_by(vdaIP=IP).first()
            userByHost = Users.query.filter(
                Users.hostname.ilike(IP.split(".")[0] + "%")).first()
            if userByVDA:
                active_users += userByVDA.name + ','
            elif userByHost:
                active_users += userByHost.name + ','
            else:
                active_users += IP.lower() + ','
            machine_obj = {
                'machine': machine.IP,
                'owner': machine.owner,
                'users': active_users[:-1],
                'actions': get_actions(machine.owner),
                'isAllocated': machine.is_allocated
            }
        response.append(machine_obj)

    return json.dumps(response)


# @app.route('/update', methods = ["POST"])
# def update():
# 	if request.form:
# 		machine = Machine(active_users = request.form.get('vda_ips'),
# 				IP = request.form.get('machine_ip'))

# 		db.session.add(machine)
# 		db.session.commit()

# 		return "Added Machine and Users"


def is_user_logged_in():
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
