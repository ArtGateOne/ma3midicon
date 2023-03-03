# ma3midicon
nodejs code to control ma3onpc 



HOW TO!


Download and install NodeJS version 14.17 from https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi

Download my code archive & unrar to c: (or where U want)


Start grandMA3

Tunr on web remote if disabled . ( i use web remote to control encoders)

Prepare OSC to recive osc commands.

GO to setup / in out / osc

Select loopback interface (127.0.0.1), and insert new osc data

Click ReceiveAll and ReceiveCommandsAll

Port 8000
------------------------


Now start my code from icon (u need change default tool to nodejs) or

start my code from command prompt CMD (WIN + R) 

node ma3midicon.js


---------------------------------
Select page for abc buttons and faders 1-16

S buttons - select encoder page


A buttons 301-308

B buttons 201-208

C buttons 101-108




Faders 201-208

Master fader - grand master + BO



Select Page for right side buttons 1-16


Right side buttons (WING 2)

Buttons 1-8 416-425

Buttons 9-16 316-325

Buttons 17-24 216-225

Buttons 25-32 116-125


Encoders - control BIG ENCODERS 1 2 and 3



touch buttons = Xkeys (only page 1)

1-6 291-297

7-12 191-197
