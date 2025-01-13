##### first use: npm install
##### for build project use:  npm run build
##### for start the project use : npm start

#### for tests in postman use the next steps:
##### 1.- Open Postman: Launch the Postman application.
##### 2.- Create a New Request: Set up a new request in Postman by specifying the request type GET and the endpoint URL http://localhost:3000
##### 3.- Send the Request: Hit send and view the response from your server.
##### 4.- Analyze the Response: Check the status code, response body, and headers to ensure your API behaves correctly.

## for create tables with prisma: npx prisma generate 
## then: npx prisma migrate dev --name init
## for execute typescript compilator in watch mode: open a new terminal in folder project and paste command: tsc --watch 

## for create users:
##{
##    "username" : "admin",
##    "password" : "123456789",
##    "email" : "admin@gmail.com",
##    "roleId" : 1
##}

## for login(existing user in online database):
##{
##    "username": "admin",
##    "password": "123456789" 
##}


## example .env
## PORT=3000
## VERSION=0.0.1
## APPNAME="PAYMENT-BUTTON"
## SECRETKEY=45205688-08fc-4683-8800-f84b84a24604
## DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres?schema=dev"
## EMAIL=""
## PASSWORD="" //remember: create an application password to use send emails option, for this project I use gmail