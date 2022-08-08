# SManager

An Ionic Angular android application for managing your income and expenses in multiple bank account.

`App is yet to be released. Stay Tuned...!`

## Contributing to the project

* Clone the repository from [GitHub](https://github.com/the-vv/SManager-App.git)
* Create a new branch for your changes
* Commit your changes to the new branch
* Push your branch to GitHub
* Open a pull request on GitHub


## Running and Installation of the app

* Install Ionic CLI using `npm install -g ionic` if not already installed
* Run `npm install`
* Run `ionic capacitor sync android`
* Run `ionic serve` to run the app in your browser
* Run `ionic capacitor run android` to run the app in your emulator
* Use flags `-l` and `--external` with the above command to run the app in the real device with a local server
* To build the app for production, run `ionic capacitor build android`


### Configuring Firebase

* Go to the Firebase console and create a new Android and Web project
* Download `google-services.json` file from the Firebase console and replace it in the `android\app\` folder of the project
* Copy firebase web config API keys from the Firebase console and replace it in the `enviornment.ts` file of the project 
* Go To Google Cloud Console and configure your application
* Go to Google Cloud Console and copy the `Client ID` 
* Replace this `Client ID` in all these files:
    * `capacitor.config.json`
    * `capacitor.config.ts`
    * `index.html`
    * `android/app/src/main/res/values/strings.xml`
    * `enviornments/enviroment.ts`
    * `enviornments/enviroment.prod.ts`
* Run `ionic capacitor sync`
* Run `ionic capacitor run android`
* Happy Coding...!

