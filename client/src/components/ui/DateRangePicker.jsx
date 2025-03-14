import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
export default function DateRangePickerValue({ dateRange, setDateRange }) {
  return <DateRangePicker value={dateRange} onChange={setDateRange} />;
}
