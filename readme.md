# Description

API for returning similarly colored products using the Google Vision API.

A cli allows you to perform various actions

This app used only one package `colour-promixity` and no framework

## Required

Node version 8.11.4

Api key Google vision API

## Config
The file `lib/config.js` allows you to configure :
- the http server listening port
- Url api vision
- The max score color ( actually 10 )
 
## Getting started

To install app
```
npm install
```

To launch app
```
VISION_API_KEY=$YOUR_KEY npm start dev
``` 

To launch test
```
npm start test
```

## Infos

To see all the commands made available, in the console

```
man
```

All the data are stored by the local storage, they will be in folder .data

## API

The end point of the api :
`http://localhost:3000/products/color/:id`


