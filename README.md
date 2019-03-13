# Train-Scheduler

* Anyone can view the train schedule.
* Logged in users have the ability to 'Add a Train', 'Edit a Train' or 'Delete a Train'.
* Firebase auth was used as the login framework.
* Google and GitHub are the only supported login methods
* All user input is validated for all fields (including input in modals) with error messages being displayed if validation fails.
* A modal will open if a user tries to delete a train asking for confirmation.
* A modal will open if a user tries to edit a train and they will be provided with input fields to do so.
* Once users are logged in, the 'Logout' button will be displayed... which they can use to log out.
* moment.js is used for time formatting

## Still to do on this project

* Reorder trains by Train Name when a new train is added
* Automatically update Minutes Away every minute