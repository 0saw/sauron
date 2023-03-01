import { HTMLProps } from 'react';

export type SelectOption = {
  text: string;
  value: string | number;
  disabled?: boolean;
}

interface Props extends HTMLProps<HTMLSelectElement> {
  options?: SelectOption[];
}

export const Select = (props: Props) => {
  const {
    options = [],
    ...rest
  } = props;

  return (
    <select {...rest}>
      {options.map(({ text, value, disabled }) => (
        <option
          key={value}
          value={value}
          disabled={disabled}
        >
          {text}
        </option>
      ))}
    </select>
  );
};
