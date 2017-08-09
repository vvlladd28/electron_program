const { app, BrowserWindow, ipcMain } = require('electron');
const generator = require('./core/generator');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 720, height: 480, titleBarStyle: 'hidden' });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('did-finish-load');
    });
}

function handleSubmission() {
    ipcMain.on('did-submit-form', (event, argument) => {
        const { source, destination, name, fps } = argument;
        generator(source, destination, name, fps).then(
            success => {
                console.log(success);
                event.sender.send('processing-did-succeed', /^(.*?.html)/m.exec(success)[1]);
            },
            error => {
                console.log(error);
                event.sender.send('processing-did-fail', error);
            }
        );
    });
}

app.on('ready', () => {
    createWindow();
    handleSubmission();
});

app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
