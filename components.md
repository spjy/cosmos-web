## Activity

Retrieves data from a web socket. Displays an event along with the timestamp.

This component does not have any props.

## Chart

Display data on a chart.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**XDataKey** | `String` | `null` | :x: | X-axis key to display from the data JSON object above
**children** | `ReactNode` | `null` | :x: | Children node
**name** | `String` | `''` | :x: | Name of the component to display at the time
**plots** | `Array[]<Shape>` | `[]` | :x: | Plot options for each chart
**plots[].YDataKey** | `String` |  | :x: | Data key to plot on the y-axis
**plots[].live** | `Boolean` |  | :x: | Whether the chart displays live values
**plots[].marker** | `Shape` |  | :x: | 
**plots[].marker.color** | `String` |  | :x: | Chart marker color
**plots[].mode** | `String` |  | :x: | Plot.ly chart mode
**plots[].name** | `String` |  | :x: | Chart name/title
**plots[].nodeProcess** | `String` |  | :x: | Name of the node:process to listen to
**plots[].processYDataKey** | `Function` |  | :x: | Function to modify the Y Data key
**plots[].type** | `String` |  | :x: | Plot.ly chart type
**plots[].x** | `Array[]<*>` |  | :x: | Array of chart y values
**plots[].y** | `Array[]<*>` |  | :x: | Array of chart x values
**processXDataKey** | `Function` | `x => x` | :x: | Function to process the X-axis key

## Clock

Display a specified local time and UTC time.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**timezone** | `String` | `'Pacific/Honolulu'` | :x: | The selected local timezone

## Attitude

Visualizes the attitude of an object.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**attitudes** | `Array[]<Shape>` | `[]` | :x: | Currently displayed attitudes
**attitudes[].name** | `String` |  | :x: | Name of the attitude display
**attitudes[].nodeProcess** | `String` |  | :x: | node:process to look at for retrieving attitude data
**name** | `String` | `''` | :x: | Name of the component to display at the time
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)

## Commands

Send commands to agents. Simulates a CLI.

This component does not have any props.

## Content

A general purpose component.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**children** | `ReactNode` | `null` | :x: | Children node
**formItems** | `ReactNode` | `null` | :x: | Form node
**liveOnly** | `Boolean` | `true` | :x: | Whether the component can display only live data. Hides/shows the live/past switch.
**name** | `String` | `''` | :x: | Name of the component to display at the time
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)
**subheader** | `String` | `null` | :x: | Supplementary information below the name

## DisplayValue

Displays a specified live value from an agent.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**displayValues** | `Array[]<Shape>` | `[]` | :x: | The values to display
**displayValues[].dataKey** | `String` |  | :x: | The data key to pull the value from
**displayValues[].name** | `String` |  | :x: | Display name of the value
**displayValues[].nodeProcess** | `String` |  | :x: | the node:process to pull the value from
**displayValues[].processDataKey** | `Function` |  | :x: | The function to put the value through to manipulate it
**displayValues[].unit** | `String` |  | :x: | The unit of the
**name** | `String` | `''` | :x: | Name of the component to display at the time

## Divider

A simple gray line divider.

This component does not have any props.

## Example

This component does not have any props.

## SetValues

Component to conveniently send values via an agent command.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**formItems** | `ReactNode` | `null` | :x: | Form node
**liveOnly** | `Boolean` | `true` | :x: | Whether the component can display only live data. Hides/shows the live/past switch.
**name** | `String` | `''` | :x: | Name of the component to display at the time
**node** | `String` |  | :white_check_mark: | The node of the agent to set the values
**proc** | `String` |  | :white_check_mark: | The process of the agent to set the values
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)
**subheader** | `String` | `null` | :x: | Supplementary information below the name
**values** | `Shape` |  | :white_check_mark: | Values to change

## CesiumGlobe

Displays a globe with the orbit and orbit history.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**name** | `String` | `''` | :x: | Name of the component to display at the time
**orbits** | `Array[]<Shape>` | `[]` | :x: | Default orbits to display
**orbits[].dataKeys** | `Array[]<Shape>` |  | :x: | 
**orbits[].dataKeys[].dataKey** | `String` |  | :x: | 
**orbits[].dataKeys[].live** | `Boolean` |  | :x: | 
**orbits[].dataKeys[].modelFileName** | `String` |  | :x: | 
**orbits[].dataKeys[].name** | `String` |  | :x: | 
**orbits[].dataKeys[].nodeProcess** | `String` |  | :x: | 
**orbits[].dataKeys[].processDataKey** | `Function` |  | :x: | 
**orbits[].name** | `String` |  | :x: | 
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)

## Status

Retrieves the agent list and displays it in a table.
Also displays the timestamp of the agent's last heartbeat.

This component does not have any props.

## ThreeD

Displays a 3D model.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**attitudes** | `Array[]<Shape>` | `[]` | :x: | Currently displayed attitudes
**attitudes[].name** | `String` |  | :x: | 
**attitudes[].nodeProcess** | `String` |  | :x: | 
**name** | `String` | `''` | :x: | Name of the component to display at the time
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)

## UploadFile

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**command** | `String` |  | :white_check_mark: | 
**node** | `String` |  | :white_check_mark: | 
**proc** | `String` |  | :white_check_mark: | 

