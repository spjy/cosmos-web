# MASDR COSMOS Web Usage

## COSMOS Web

### Requirements

1. [Node.js 10.x](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
2. [Agent Socket](https://github.com/spjy/cosmos-socket)

### Installing

Open a terminal and change directories to the location you want to install the repository.

```
git clone https://github.com/spjy/cosmos-web.git
cd cosmos-web
npm install
```

If you need to modify the default environment variable values (do not modify .env.defaults directly):

```
cp .env.defaults .env
```

```
WEBSOCKET_IP=localhost # Agent Mongo IP
QUERY_WEBSOCKET_PORT=8080 # Port of the WS to access the query endpoints
LIVE_WEBSOCKET_PORT=8081 # Port of the WS to access the live endpoints
CESIUM_ION_TOKEN= # Token for the globe simulation (optional)
```

## Agent Socket

Agent Socket, the server portion of COSMOS Web, handles the incoming UDP data and retrieves data from other agents. It then manipulates the data and sends it to COSMOS Web via a Websocket.

### Requirements

1. C++17
2. [GCC/G++ 7.4.0+](https://gist.github.com/jlblancoc/99521194aba975286c80f93e47966dc5)
3. [Crypto](https://github.com/openssl/openssl)
4. [Boost](https://www.boost.org/doc/libs/1_66_0/more/getting_started/unix-variants.html)

### Installation

```bash
# Clone repository
git clone https://github.com/spjy/cosmos-socket.git /path/to/cosmos/source/projects
cd cosmos-socket

# Make build folder
mkdir build
cd build

# Compile
cmake ../source
make
```

### Usage

#### UDP Server

Agent Socket has a UDP server and is listening to requests on port `:5005`. Only send ASCII values to it.

# In practice

### Running

In the build folder created in the installation steps, run:

**Note**: When pulling, if you see `package.json` changed in the COSMOS Web repository, run `npm install` before running `npm start`.

**Note**: If you start Agent Socket after COSMOS Web or Agent Socket is terminated, be sure to reload the COSMOS web page so the two can connect correctly.

```bash
# Run agent socket first so Web can connect to the socket server, listen only to the MASDR node
./agent_socket --include masdr

# Start COSMOS Web
npm start
```

### Ground Station Page

1. After running `npm start`, COSMOS Web should pop up automatically in your web browser with the IP `http://localhost:5000`.
2. Once it pops up, on the navigation bar hover over 'Ground Stations' and click 'MASDR'. 

### Components

**GS Values**

GS values displays the live values, such as the frequency.

1. Be sure Agent Nordiasoft is running.

**Time**

Displays the Honolulu and UTC times.

**Upload**

Gives the ability to upload a TLE file.

This is equivilent to sending the command `agent masdr nordiasoft tle VALUE`.

1. Be sure Agent Socket and Agent Nordiasoft are running.
2. Simply drag the TLE file onto the "Select Files" box or click the box and browse for the file.
3. When ready to upload, click "Upload Files".

**Commands**

Gives the ability to send agent commands via the GUI.

1. Be sure that Agent Socket and Agent Nordiasoft are running.
2. First, to retrieve a certain agent's requests for quick use, enter `masdr:nordiasoft` in the top box.
3. To use macros, be sure to instantiate the needed applications for future use. If you updated the instatiated applications, click "Update Macros" to re-query the instantiated applications. The selected macro will be inserted immediately after the node process command part. For example: `agent masdr nordiasoft command MACRO args`.
4. The white box in the middle will show the commands you have sent and its response below it.
5. Send agent commands in the bottom box. Use the `-> agent` option to send regular agent formatted commands. In the box after, enter the arguments of a certain command. 
   1. If I wanted to use the regular command line style of agent commands to retrieve the HDLCEncoder values, select `-> agent` from the dropdown and in the arguments input type `masdr nordiasoft component HDLCEncoder`.
   2. For instance, if you wanted to retrieve the HDLCEncoder values, you would use the dropdown, search for the `component` request and in the arguments input, type `PropCubeWaveform HDLCEncoder`.


**Set Values**

Gives the ability to set Nordiasoft application values.

This is equivilent to sending the command `agent masdr nordiasoft configure_component COMPONENT PROPERTY VALUE`.

1. Be sure Agent Socket and Agent Nordiasoft are running.
2. The top box is for displaying the command that was sent and its response.
3. Using the first dropdown menu, select the component.
4. Using the second dropdown menu, select the property.
5. In the input, enter the value you want to change the property to.
6. Set the value using the button.
7. The bottom box is for displaying live values of the selected component in the first dropdown menu.

**Note** The dropdown menus may skip to the top if you click to scroll. Using the mouse wheel or arrow keys remedies this issue. I have attempted to resolve this, however it seems more difficult to solve than expected.

**Activity**

This displays the values sent to Agent Socket's UDP server.

1. Be sure Agent Socket is running.

**Globe**

This displays the live position of the satellite.

1. Be sure Agent Socket and Agent Nordiasoft are running.


