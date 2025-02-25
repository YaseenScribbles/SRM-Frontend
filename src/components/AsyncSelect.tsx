import React from "react";
import ReactSelect from "react-select/async";
import {
  colorGreyDark2,
  colorGreyLight1,
  colorGreyLight2,
  colorSecondary,
} from "../assets/constants";

type Option = {
  label: string;
  value: string;
};

type Props = {
  id: string;
  placeholder: string;
  loadOptions: (query: string) => Promise<Option[]>;
  value: Option | null;
  handleChange: (e : Option | null) => void;
  isDisabled?: boolean;
};

const AsyncCustomSelect: React.FC<Props> = ({
  id,
  placeholder,
  loadOptions,
  value,
  handleChange,
  isDisabled = false,
}) => {
  return (
    <>
      <ReactSelect
        className="select"
        id={id}
        isClearable
        cacheOptions
        loadOptions={loadOptions}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        isDisabled={isDisabled}
        styles={{
          control: (baseStyles, { isFocused }) => ({
            ...baseStyles,
            borderColor: isFocused ? colorSecondary : "transparent",
            backgroundColor: colorGreyLight2,
            color: colorGreyDark2,
            fontSize: "1.4rem",
            borderRadius: "1rem",
            ":hover": {
              border: `1px solid ${colorSecondary}`,
            },
          }),
          input: (baseStyles, {}) => ({
            ...baseStyles,
            color: colorGreyDark2,
          }),
          option: (baseStyles, {}) => ({
            ...baseStyles,
            fontSize: "1.4rem",
          }),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary50: colorGreyLight1,
            primary25: colorGreyLight2,
            primary: colorSecondary,
            neutral80: colorGreyDark2,
          },
        })}
      />
      <label htmlFor={id} className={`${value ? "show" : ""}`}>
        {placeholder}
      </label>
    </>
  );
};

export default AsyncCustomSelect;
