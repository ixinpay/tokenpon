// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
   //Prod configuration
   //production: true,
   //HttpProvider: "",
   // //web3HttpProvider: "https://www.linkgear.net/ligear/gegeChain/",
   //OothAPI: 'https://linkgear.net:8091/auth/',
   //MongoAPI: 'https://linkgear.net:8080/api/',
   //SwarmProvider: 'https://www.linkgear.net/swarm/',
   //************************************************
   //QA configuration
   production: false,
   HttpProvider: "http://localhost:8545",
   // web3HttpProvider: "http://34.238.58.243:8506",
   //IxinAPI: 'https://ixinhub.com:8061/auth/',
   //OothAPI: 'https://ixinhub.com:8061/auth/',
   //MongoAPI: 'https://ixinhub.com:6060/api/',
   IxinAPI: 'https://login.ixinhub.com/auth/',
   OothAPI: 'https://login.ixinhub.com/auth/',
   MongoAPI: 'https://api.ixinhub.com/api/',
   SwarmProvider: 'https://ixinhub.com/swarm/',
   GoogleGeocodingAPI: "https://maps.googleapis.com/maps/api/geocode/json?address={addr}&key=AIzaSyA5IGhOP4Sk_MzGLLMtmmjdXNP1bN_3Y_g",
   // SwarmProvider: 'http://swarm-gateways.net/',
   //************************************************
   // Common
   inactivitySec: 300,
   pingIntervalSec: 15,
   chainPageImageMaxSize: 2000000,
   TokenponImageMaxCount: 5,
   BusinessProfileLogoMaxCount: 1
};
