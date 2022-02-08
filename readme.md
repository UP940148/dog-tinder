# Dog Tinder application

This repository shows the solution I created for my first year *'Application Programming'* coursework. The task was to create a system which allowed users to create a profile for their dog with pictures and descriptions, and then be able to view other profiles, and if both profiles like each other, then a match is made.

This submission achieved a mark of 68%

*All the images found in the ./www/img/ directory were willingly sent to me for use in this project, and I received consent to include them in the final release.\
Should any of the original image owners wish for me to remove them, please contact me and I will promptly do so.*

# UP940148 Coursework
## Setup
To run this project, install it locally using npm:
```
$ cd ../UP940148
$ npm install
$ npm start
```

## Operation
##### On Startup
App will begin running on localhost:8080

##### Signing up/Logging in
User should log in to a valid Google account, after this, the user should enter a password for the app, and then submit the form

If the user already has an account, then when they log in to their Google account, they will be automatically redirected to the profile browsing page without the need to enter their application password

##### Creating a profile
Every account can have one profile associated with it, this profile must be created upon first login. The profile relates to the dog being registered, so the user shouldn't enter details relating to themselves as these details can't be changed later

##### Customising profile
The user profile page allows the user to add and remove pictures to the profile, as well as customising their profile's bio.
Changes made on this page are applied instantly

##### Profile Browsing
After creating a profile, the user can view other profiles that have been created. The user has the option to like or dislike any profile they find and they can look through all profile pictures on the current profile by clicking on the picture. This will loop through all pictures associated with that profile.
Upon liking a profile, if the user who owns that profile also likes the user's profile, the profiles will be _'matched'_. You can view these matches at any time in the matches page.
If the user dislikes a profile, they will continue browsing other profiles, and the disliked profile may reappear. This is to stop a user from accidentally disliking a profile and then not being able to see it again. If the disliked profile has liked the user, the match will be rejected. If the user dislikes a profile that they previously liked, the match request will be deleted, even if the match was accepted by the other user

##### Viewing matches
A user can view their matches at any time by navigating to their matches page. This page shows the user which profiles they have matched with, as well as any profiles that they have liked, but where the other user hasn't yet made a decision on their profile

## Known bugs:
1: Upon creating an account, the user gets redirected to the profile creation page. If this page is unloaded before submitting the creation form, this page cannot be accessed again and the user won't be able to create a profile. This causes errors on other pages, as they all pull information from the user's profile. If this does happen, manually redirect to `localhost:8080/HTML/createProfilePage.html/` and continue as normal.

## Other notes:
On the user profile page, if left open for a while and not all <img> elements have a picture, console returns ERR_EMPTY_RESPONSE as it can't find the source file to put in the frame. Not considered a bug because it has no impact on performance or usability


## Future development:
##### Messaging
Currently two users can match, however they are unable to message each other. I plan on adding this feature as soon as I can

##### Multiple profiles
Currently the application is restricted to one profile per user, however there is appropriate framework in place to allow future expansion which would enable any user to manage multiple profiles

## Source credit:
All pictures used in testing data were kindly submit by friends and family for use in this project under the agreement that they would be attached in the final project as stock profiles.
