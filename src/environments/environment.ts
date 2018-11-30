// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  //API: "https://jtechbutterflyapi.azurewebsites.net/api" // prod api
  //API : "https://jtechbutterflyapidev.azurewebsites.net/api" // dev api
  //API : "https://jtechbutterflyapistaging.azurewebsites.net/api" // staging api
  API: "https://jtechbutterflyapiofflinedev.azurewebsites.net/api" //offline
  //PI : "https://jtechbutterflyapofflinestaging.azurewebsites.net/api" //staging offline
  //API : "https://192.168.50.233/Jtech.butterfly.api/api" // Ezil local machine
  //API : "https://jtechbutterflyapiofflineqc.azurewebsites.net/api" //dev/qc offline
};
