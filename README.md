# riddimfutár-api

This is a Serverless API with Node.js and AWS for the RIDDIMFUTÁR app.

## Important legal stuff

**This project is not afflitiated with the Budapesti Közlekedési Központ (BKK) and the Forgalomirányítási és Utastájékoztatási Rendszer (FUTÁR) in any way. This project is solely for educational and experimental purposes.**

## File structure

```
- dataSrc
    - gtfs
        - feed_info.txt
        - agency.txt
        - shapes.txt
        - routes.txt
        - stops.txt
        - trips.txt
        - stop_times.txt
        - calendar_dates.txt
        - pathways.txt
    - mp3
        - nnn.mp3
- dataGen
    - data.json
```

GTFS data provided by BKK: [source](https://bkk.hu/apps/gtfs/)

## Scripts

Run with `npm run [scriptname]`

- `listen`
  - Listens to the mp3 files under `dataSrc/mp3/xxx.mp3` and renames them to match their content. E.g. if the filename is `03.mp3` and the content is `Széll Kálmán tér metróállomás`, the filename is going to be `szellkalmanterm.mp3`.

- `initDb`
  - Initializes mongodb on the specified URL with names of the stops and the matched MP3 files.

## Environment variables

- `GOOGLE_APPLICATION_CREDENTIALS`
  - can be obtained at the [Google Cloud Platform Console](https://console.cloud.google.com/apis/credentials)
