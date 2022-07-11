<a style="display: flex; width: 100%" href="https://github.com/Ralsin/rblxcord">
  <img style="width: 150px; margin: auto;" alt="Project logo" src="https://raw.githubusercontent.com/Ralsin/rblxcord/main/src/media/rblxcord.png" />
</a>

# Roblox Rich Presence - Rblxcord

A rich presence application developed for Roblox, data information is taken from the official website and the running Roblox game.

The app needs to be built using electron-builder to run the app.
These steps to build the application require downloading the repository.

## Installing a repository

### 1. Download the repository to your computer or device

```bash
git clone https://github.com/Ralsin/rblxcord.git
```

### 2. Specify the id of your discord application _(this action is necessary for all subsequent ones)_

Rename `.env.scheme` to `.env`

Add your discord application id like as example below

```bash
# .env
clientId=your_id_here
```

### 3. Starting the project and building it

Run one of the commands below while in the project folder:

```bash
npm run start # for development
# or
npm run build # for build running application
```

### 4. Application usage

The application will immediately start in the tray, if you are running the application for the first time, select `Authorize`.
Then restart the application and then select `Show`.

Enter any Roblox game, app will automatically detect a found game.

Don't forget to include an item in Discord called `Display the game you're playing`.

## License

The repository and application are licensed under `GPL-3.0`
