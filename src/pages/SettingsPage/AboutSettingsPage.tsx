import Setting, { SettingType } from '@components/Setting';
import './styles.scss';

const AboutSettingsPage = () => {
  return (
    <div className="settings__main">
      <div className="settings__header">
        <h1>About</h1>
      </div>

      <Setting type={SettingType.INFO} title="App version" infoValue={window.app.getVersion()} />
      <Setting type={SettingType.INFO} title="System OS" infoValue={window.app.getPlatform()} />
      <Setting
        type={SettingType.INFO}
        title="System architecture"
        infoValue={window.app.getArch()}
      />
      <Setting
        type={SettingType.INFO}
        title="Chrome version"
        infoValue={window.app.getChromeVersion()}
      />
      <Setting
        type={SettingType.INFO}
        title="Electron version"
        infoValue={window.app.getElectronVersion()}
      />

      {/* TODO: Add link to GitHub page here */}
    </div>
  );
};

export default AboutSettingsPage;
