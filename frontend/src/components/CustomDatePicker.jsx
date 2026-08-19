import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomDatePicker({
  value,
  onChange,
  className,
  placeholderText = "DD/MM/YYYY",
  disabled = false,
  isClearable = true,
}) {
  const handleKeyDown = (e) => {
    // Allow numbers, slash, backspace, delete, arrows, tab, and standard modifiers
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "/"];
    if (
      !allowed.includes(e.key) &&
      !/^[0-9]$/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleRawChange = (e) => {
    let val = e.target.value;
    // Auto-pad single digits followed by slash
    if (val.length === 2 && val.endsWith("/")) val = "0" + val;
    if (val.length === 5 && val.endsWith("/"))
      val = val.slice(0, 3) + "0" + val.slice(3);

    // Strip out anything that is not a number
    let v = val.replace(/[^0-9]/g, "");
    if (v.length > 8) v = v.slice(0, 8);

    let day = v.substring(0, 2);
    let month = v.substring(2, 4);
    let year = v.substring(4, 8);

    // Smart Day limits
    if (day.length === 1 && parseInt(day) > 3) day = `0${day}`;
    if (day.length === 2 && parseInt(day) > 31) day = "31";
    if (day.length === 2 && day === "00") day = "01";

    // Smart Month limits
    if (month.length === 1 && parseInt(month) > 1) month = `0${month}`;
    if (month.length === 2 && parseInt(month) > 12) month = "12";
    if (month.length === 2 && month === "00") month = "01";

    let formatted = day;
    if (v.length > 2) formatted += "/" + month;
    if (v.length > 4) formatted += "/" + year;

    e.target.value = formatted;
  };

  const handleChange = (date) => {
    if (date && !isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      // Always return standard yyyy-mm-dd string
      onChange(`${yyyy}-${mm}-${dd}`);
    } else {
      onChange("");
    }
  };

  return (
    <DatePicker
      selected={value ? new Date(value + "T00:00:00") : null}
      onChange={handleChange}
      onChangeRaw={handleRawChange}
      onKeyDown={handleKeyDown}
      className={className}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholderText}
      strictParsing={true}
      popperPlacement="bottom-start"
      isClearable={isClearable}
      disabled={disabled}
    />
  );
}
