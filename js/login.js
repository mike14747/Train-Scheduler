// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'index.html',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    // tosUrl: 'index.html',
    // Privacy policy url.
    // privacyPolicyUrl: 'index.html'
};

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

function logOut() {
    // console.log("Logout button clicked!")
    firebase.auth().signOut();
}

// hide this before uploading final version to github
// $("#log_in").show();
// $("#log_out").hide();
// $(".deleteBtn").show();

// unhide this before uploading final version to github
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // user is signed in, so display the Logout button and hide the login div
        $("#log_in").hide();
        $("#log_out").show();
        $(".deleteBtn").show();
        $(".bg-group").removeClass("bg-custom").addClass("bg-custom2");
    } else {
        // user is not signed in, so hide the Logout button and show the login div
        $("#log_in").show();
        $("#log_out").hide();
        $(".deleteBtn").hide();
        $(".bg-group").removeClass("bg-custom2").addClass("bg-custom");
    }
});