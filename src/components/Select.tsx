import React, { Dispatch, SetStateAction } from "react";
import ReactSelect from "react-select";
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
  options: Option[];
  value: Option | null;
  handleChange: Dispatch<SetStateAction<Option | null>>;
  isDisabled?: boolean;
  isLabelReq?: boolean;
};

const Select: React.FC<Props> = ({
  id,
  placeholder,
  options,
  value,
  handleChange,
  isDisabled = false,
  isLabelReq = true,
}) => {
  return (
    <>
      <ReactSelect
        className="select"
        id={id}
        options={options}
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
            fontSize: "2rem",
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
            fontSize: "2rem",
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
        isClearable
      />
      {isLabelReq && (
        <label htmlFor={id} className={`${value ? "show" : ""}`}>
          {placeholder}
        </label>
      )}
    </>
  );
};

export default Select;
