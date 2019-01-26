export const environment = {
  production: true,
  HttpProvider: "",
  // web3HttpProvider: "http://172.31.83.105:8501",
  //OothAPI: 'https://linkgear.net:8091/auth/',
  OothAPI: 'https://ixinhub.com:8061/auth/',
  //MongoAPI: 'https://linkgear.net:8080/api/',
  MongoAPI: 'https://ixinhub.com:6060/api/',
  //SwarmProvider: 'https://linkgear.net/swarm/',
  SwarmProvider: 'https://ixinhub.com/swarm/',
  GoogleGeocodingAPI: "https://maps.googleapis.com/maps/api/geocode/json?address={addr}&key=AIzaSyA5IGhOP4Sk_MzGLLMtmmjdXNP1bN_3Y_g",
  inactivitySec: 300,
  pingIntervalSec: 15,
  chainPageImageMaxSize: 2000000,
  chainPageImageMaxCount: 5
};
