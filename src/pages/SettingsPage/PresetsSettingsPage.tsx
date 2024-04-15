import DropdownSetting from "@components/Setting/DropdownSetting";
import { useState } from "react";
import "./styles.scss";

interface PresetsSettingsPageProps {}

const PresetsSettingsPage = (props: PresetsSettingsPageProps) => {
	const [messagePresets, setMessagePresets] = useState<string[]>([]);
	const [activeMessagePreset, setActiveMessagePreset] = useState<string>("perr-##-create");

	return (
		<div className="settings__main">
			<div className="settings__header">
				<h1>Message presets</h1>
			</div>
			<DropdownSetting
				title="Choose a message preset:"
				onChange={(e) => {
					setActiveMessagePreset(e.target.value);
				}}
				activeDropdownValue={activeMessagePreset}
				description="Select a message preset to edit"
				dropdownOptions={[
					{ value: "perr-##-create", label: "Create new preset" }, // Purposefully weird value use to make it unlikely for someone to want the same message preset
					{ value: "Template 3", label: "Template 3" },
				]}
			/>
		</div>
	);
};

export default PresetsSettingsPage;
