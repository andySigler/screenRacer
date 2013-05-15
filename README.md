###Screen Racer

##What is this?

Screen Racer is a multi-screen, iPhone controlled, HTML5 game, using the speed of WebSockets. All connected computers are placed into an array of screens, and become one part of a seamless landscape for which to play the game on. Once their iPhone is connected, the player is able to control and speed and height of a helicopter, which must navigate all the screens without being destroyed.

Screen Racer is a simple game, based off the classic Helicopter Game, but adds the new twist of multiple screens and remote control, something that HTML5 and new browser capabilities allow.

##Running the Game

Screen Racer uses a hard-coded IP address for the server at the moment. This was a quick fix for running the main script locally, and allowing other computers to point their socket connections at the local computer's IP.

You can find the hard-coded IP within both the "controller.html" and "screen.html" pages, given the variable name "myIP". Simply change this to your computer's current IP before running Screen Racer.