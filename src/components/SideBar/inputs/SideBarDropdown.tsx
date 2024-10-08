import { ChangeEvent } from 'react';
import './sidebar-dropdown.scss';

interface SideBarDropdownProps {
  title: string;
  defaultOption: { value: string; label: string };
  dropdownOptions?: { value: string; label: string }[];
  activeDropdownValue?: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SideBarDropdown = (props: SideBarDropdownProps) => {
  return (
    // dropdown in sidebar
    <select
      className="sidebar-dropdown"
      value={props.activeDropdownValue ?? ''}
      onChange={props.onChange}
    >
      <option value={props.defaultOption.value}>{props.defaultOption.label}</option>
      {props.dropdownOptions?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SideBarDropdown;
