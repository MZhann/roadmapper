import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  daysUntil,
  parseDate,
  parseTime,
  dateValue,
  timeValue,
} from "../src/domain/dateTime";

test("calendar values reject impossible dates and preserve local date", () => {
  assert.equal(parseDate("2026-02-29"), null);
  assert.equal(parseDate("2026-13-01"), null);
  assert.equal(dateValue(parseDate("2028-02-29")!), "2028-02-29");
  assert.equal(addDays("2028-02-28", 2), "2028-03-01");
  assert.equal(daysUntil("2026-03-09", "2026-03-07"), 3);
});
test("time picker values round-trip midnight and reject invalid times", () => {
  for (const value of ["00:00", "09:05", "19:30", "23:59"])
    assert.equal(timeValue(parseTime(value)!), value);
  for (const value of ["24:00", "12:60", "9:00", "abc"])
    assert.equal(parseTime(value), null);
});
