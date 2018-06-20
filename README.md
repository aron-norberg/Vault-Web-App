## Getting Started

- Ensure using linux
- install nodejs/npm
- navigate to project directory

''
Git clone https://github.com/fluke-corporation/Vault-Web-App
''

- Once in directory:

- to run application:


$ npm start


- to save/edit project files:

git add <filename> (If your Aron use ".")
git commit -m "m"
git pull 
git push

- to push to ec2 - auto deploy use:

git push production master

- uses auto deploy

# How it works on inter

# EC2 LIVE INSTRUCTIONS:

our node environment uses PM2:

Project: 

cheat sheet: https://gist.github.com/anmolnagpal/e1396bf7f0fc46bb5bde4146cd80c1f4

USEFUL Commands:

1. Start on ec2 (using pm2):
	$ pm2 start ./bin/www

2. Logs:
	$ pm2 logs 

3. Monitor Process:
	$ pm2 monit


##################################################
## Deployment
##################################################





##################################################
# QA Website Testing
##################################################

The QA Automated Testing Suite GUI provides an avenue for entering new Scenarios and Gherkin into the testing system, provides a means for on-click testing of the Fluke website, and a way to view test results in a graphical, friendly interface


##################################################
### Prerequisites
##################################################

Both phantom.js and Selenium are necessary for the development and testing of further PHP code (the automated tests performmed on the website).
These are not necessary to working on the GUI.
Work on the GUI requires the loading of databases into your set-up, and the running of mysql through the command line

Git Beginner's guide. Download Git repository:
https://backlog.com/git-tutorial/intro/intro1_1.html
https://github.com/fluke-corporation/behat_projects

Starting up Phantomjs from the window's command line:
C:\phantomjs-2.1.1-windows\bin> phantomjs --webdriver=8643

Starting up Selenium from the window's command line:
C:\> java -jar selenium-server-standalone-3.8.1.jar -role hub

Starting up mysql from the Ubuntu command line:
~/project/MEAN-BASE$ sudo service mysql start

See a co-worker for the database files that you will need to load






##################################################
## Authors
##################################################

James Sandoval
Aron Norberg
Jennifer Bronson

##################################################
## License
##################################################

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



