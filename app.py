
import os

from flask import Flask, render_template, request, session, redirect
from flask_sqlalchemy import SQLAlchemy


# Getting absolute path for directory, __file__ = module's name (app.py)
projectDir = os.path.dirname(os.path.abspath(__file__))

# Path for database in app's directory
databaseFile = "sqlite:///{}".format(os.path.join(projectDir, "Monito.db"))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = databaseFile
app.config["SECRET_KEY"] = os.urandom(24)
app.config["PERMANENT_SESSION_LIFETIME"] = 600 # 600 seconds

db = SQLAlchemy(app)

class User(db.Model):
	id = db.Column('userID', db.Integer, primary_key = True)
	name = db.Column(db.String(30))
	username = db.Column(db.String(20), unique = True)
	email = db.Column(db.String(30), unique = True)
	vdaIP = db.Column(db.String(15), unique = True)
	hostname = db.Column(db.String(50), unique = True)

	def __repr__(self):
		return ("<Name: {}>".format(self.name) + 
		"<Username: {}>".format(self.username) + 
		"<Email: {}>".format(self.email) + 
		"<VDA-IP: {}>".format(self.vdaIP))

class Machine(db.Model):
	id = db.Column('machineID', db.Integer, primary_key = True)
	IP = db.Column(db.String(15), unique = True)
	vdaIPs = db.Column(db.String(200))

	def __repr__(self):
		return ("<Machine IP: {}".format(self.IP) + " VDA-IPs: {}>".format(self.vdaIPs))


@app.route('/', methods = ["GET", "POST"])
def login():
	users = User.query.all()
	session.clear()

	if request.form:
		userName = request.form.get('username').lower()

		for user in users:
			if user.username == userName:
				session['user_name'] = user.username
				return redirect('/dashboard')

		return render_template('login.html', SERVER_ERROR = 'Oops! Incorrect username.')

	return render_template('login.html')

@app.route('/register', methods = ["GET", "POST"])
def register():
	users = User.query.all()
	userExists = False

	if request.form:

		user = User(name = request.form.get('user_name').lower(), 
			username = request.form.get('username').lower(), 
			email = request.form.get('user_email').lower(),
			vdaIP = request.form.get('user_vda-ip'),
			hostname = request.form.get('user_hostname').lower())

		for elem in users:
			if elem.username == user.username or elem.email == user.email \
			or elem.vdaIP == user.vdaIP or elem.hostname == user.hostname:
				userExists = True
				break

		if not userExists:
			db.session.add(user)
			db.session.commit()

			return redirect('/')

		return render_template('register.html', SERVER_ERROR = 'User already exists!')

	return render_template('register.html')

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/dashboard')
def dashboard():
	if isUserLoggedIn():
		username = session['user_name']
		currentUser = User.query.filter_by(username = username).first()

		return render_template('dashboard.html', currentUser = currentUser)
	else:
		return redirect('/')

@app.route('/mapping', methods = ["POST"])
def mapping():
	if request.form:
		machine = Machine(vdaIPs = request.form.get('vda_ips'), 
				IP = request.form.get('machine_ip'))
		dbMachine = Machine.query.filter_by(IP = machine.IP).first()
		
		if dbMachine:
			dbMachine.vdaIPs = machine.vdaIPs
			db.session.commit()
			return 'Updated Machine'
		else:
			db.session.add(machine)
			db.session.commit()
			return 'Added Machine'

@app.route('/mappings')
def mappings():
	machines = Machine.query.all()
	users = User.query.all()
	machinesStr = ''

	for machine in machines:
		vdaIPs = machine.vdaIPs.split(',')
		vdaNameMap = ''

		for IP in vdaIPs:
			userByVDA = User.query.filter_by(vdaIP = IP).first()
			userByHost = User.query.filter_by(hostname = IP.lower()).first()

			if userByVDA:
				vdaNameMap += userByVDA.name + ','
			elif userByHost:
				vdaNameMap += userByHost.name + ','
			else:
				vdaNameMap += IP.lower() + ','

		machinesStr += machine.IP + ':' + vdaNameMap[:-1] + ';'

	return machinesStr[:-1]

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

if __name__ == "__main__":
	db.create_all()
	app.run(host="0.0.0.0")



