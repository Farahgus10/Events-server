drop table if exists events;

CREATE TABLE events (
    id INTEGER primary key generated by default as identity,
  event_name text not null,
  event_date date,
  event_start_time time,
  event_end_time time,
  event_venue text not null,
  info text
);