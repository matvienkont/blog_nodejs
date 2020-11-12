# NodeJS Blog

This application covered almost all of the points mentioned in the task:
- [x] Register user
  - [x] User validation and sanitizing
- [x] JWT authorization
- [x] Edit user profile
- [x] CRUD posts
  - [x] Create post
  - [x] Show posts on pages (paging system)
  - [x] Post editing
  - [x] Get individual post
  - [x] Delete post
- [x] Statistics: amount of posts per day
# +
- [x] Access Token authorization and Refresh Token endpoint to refresh Access Token
- [x] Search by title name or content
- [x] HTML support inside 
- [x] Sending email as a confirmation
  - [x] Sending email confirmation on email change

#### Known issues

    - Errors are not user-friendly for the user, as a reason of session-less organisation. Those errors must be processed 
      on a front-end part using **res** object.
    - Access tokens and Refresh tokens are stored inside cookies. Possible solution: adding SameSite attribute. 
-----
## Getting started
- Clone repo, `npm install`
- You need to have mongodb on a host. Connection settings are inside `.env` file. This pushed `.env` file to repo carries showcase scenario.

### Note
- Application uses gmail account for testing purposes. No need to change anything.
