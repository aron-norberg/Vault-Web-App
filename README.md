# delete versioning? deployment? contributing? License?

James and Aron are awesome!   WOOT!  I love Droop the Goblin.

##################################################
# QA Website Testing
##################################################

The QA Automated Testing Suite GUI provides an avenue for entering new Scenarios and Gherkin into the testing system, provides a means for on-click testing of the Fluke website, and a way to view test results in a graphical, friendly interface

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
Visit GitHub at https://github.com/fluke-corporation/behat_projects and clone the repository to your work computer.  Developers have been using Sublime as their text editor of choice, and the Ubuntu command line for development purposes.
To use the GUI, without any development purposes, contact a developer to be given a login name and password.

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
### Installing
##################################################

Install Node:  https://nodejs.org/en/
Install
Install
Install


End with an example of getting some data out of the system or using it for a little demo

##################################################
## Running the tests
##################################################

How to run the automated tests for this system...

Fromthe GUI:
Open your ec2 instance so that you can view the GUI
On the Test Runner page, you can Start tests by Feature Page

From the Ubuntu command line:
You can call the run file for the particular Feature Page (e.g. /behat_run_f2.sh)
Be sure that you run this from the MEAN-BASE file such as..
@PC-EVT-5NJHG12:~/project/MEAN-BASE$ ./behat_run_f10.sh
The run file points to a list of URLs that are to be tested in a line such as...
linkInput="inputFiles/f2_input/f2_all.txt"
Different choices are available under the inputFiles folder.  Be sure to point to the correct list of URLs when running tests.


##################################################
### Break down into end to end tests
##################################################

Explanation of what these tests test and why

The testing code contained in this project tests both content and functionality of the Fluke Website.

The Gherkin resides under master_tests, base_features, by feature page such as f10_base.feature
These pages list all Gherkin related to a specific "Feature Page." A "Feature Page" is a particular style of page (such as the style of page used for all products).
An example of Gherkin:
	Scenario: Are all the images filled?
		Then I should see all images "img"


##################################################
## Deployment
##################################################

Add additional notes about how to deploy this on a live system

##################################################
## Built With
##################################################

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

##################################################
## Contributing
##################################################

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

##################################################
## Versioning
##################################################

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

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

##################################################
## Acknowledgments
##################################################

* Hat tip to anyone who's code was used
* Inspiration

Philipp von Wedel (progress bar)
https://codepen.io/pvonwedel/pen/IEFks?limit=all&page=4&q=progress+bar
 
Petr Tichy (loading animation)
https://ihatetomatoes.net/create-custom-preloading-screen/

