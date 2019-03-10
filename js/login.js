// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // user is signed in
            return true;
        },
        uiShown: function () {
            // the widget is rendered, so hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'index.html',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
    ]
};

// this will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

function logOut() {
    firebase.auth().signOut();
}

setTimeout(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // user is signed in, so display the Logout button and hide the login div
            $("#log_in").hide();
            $("#log_out").show();
            $(".deleteBtn").show();
        } else {
            // user is not signed in, so hide the Logout button and show the login div
            $("#log_in").show();
            $("#log_out").hide();
            $(".deleteBtn").hide();
        }
    });
}, 2000);