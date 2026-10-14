export type DateTimeFieldProps = {
  mode: "date" | "time";
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
  maximumDate?: string;
  disabled?: boolean;
};
