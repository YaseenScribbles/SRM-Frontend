import React, { SetStateAction, useEffect, useRef, useState } from "react";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker, Range } from "react-date-range";
import { colorSecondary } from "../assets/constants";
import { format } from "date-fns";

type Props = {
  show: boolean;
  setDuration: React.Dispatch<
    SetStateAction<{ fromDate: string; toDate: string }>
  >;
  setShow: React.Dispatch<SetStateAction<boolean>>;
  buttonRef: React.RefObject<HTMLButtonElement>;
};

const MyDateRangePicker: React.FC<Props> = ({
  show,
  setDuration,
  setShow,
  buttonRef,
}) => {
  const [duration, _setDuration] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setDuration((prev) => ({
      ...prev,
      fromDate: format(duration[0].startDate as Date, "yyyy-MM-dd"),
      toDate: format(duration[0].endDate as Date, "yyyy-MM-dd"),
    }));
  }, [duration]);

  return (
    <div ref={ref} className={`date-range ${show ? "show" : ""}`}>
      <DateRangePicker
        ranges={duration}
        rangeColors={[`${colorSecondary}`]}
        onChange={(e) => _setDuration([e.selection])}
      />
    </div>
  );
};

export default MyDateRangePicker;
