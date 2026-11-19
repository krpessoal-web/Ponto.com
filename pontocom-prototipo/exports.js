/* Kronius — documentos exportados (PDF/Excel) com a identidade visual do sistema */
(function(){
const KR_TILE="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNDNDI5M0QiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NjA3MTMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjExMiIgZmlsbD0idXJsKCN0KSIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMCAxMTEpIHNjYWxlKDEuNykiPjxwYXRoIGQ9Ik0zMi41NiAxNTguNjRDMzUuNzUgMTU3Ljg2IDM4LjE1IDE1Ni43NiA0MC40NSAxNTUuMDZDNDEuMDIgMTU0LjY0IDQzLjE0IDE1Mi42MCA0NS40NCAxNTAuMjdDNDcuNjQgMTQ4LjA0IDUyLjMzIDE0My4yOCA1NS44OCAxMzkuNjlDNTkuNDIgMTM2LjEwIDY0LjY1IDEzMC43OCA2Ny41MCAxMjcuODdDNzcuODMgMTE3LjMwIDEwMi4yNyA5Mi41MSAxMTUuMDcgNzkuNjJDMTE5LjEzIDc1LjUzIDEyNC43NSA2OS44MyAxMjcuNTYgNjYuOTRDMTMwLjM3IDY0LjA1IDEzNS4xMCA1OS4yNCAxMzguMDYgNTYuMjVDMTUwLjY3IDQzLjUxIDE1NC43MSAzOS40MSAxNjMuODggMzAuMDZDMTY5LjIxIDI0LjYzIDE3NC42MSAxOS4xMiAxNzUuODkgMTcuODFDMTc4LjI2IDE1LjM4IDE3OC43NSAxNC43MyAxNzguNzUgMTMuOTRDMTc4Ljc1IDEzLjA3IDE3OC4wNiAxMi4yNSAxNzcuMTIgMTIuMDBDMTc2Ljc3IDExLjkwIDE2Ny43OSAxMS44OCAxNDcuMDkgMTEuOTFMMTE3LjU2IDExLjk2IEwxMTYuMTkgMTIuMjJDMTE1LjQzIDEyLjM3IDExNC4yOCAxMi42MCAxMTMuNjIgMTIuNzNDMTA5Ljc3IDEzLjUyIDEwNS40MyAxNi4xMCAxMDIuNTYgMTkuMzNDMTAyLjA4IDE5Ljg3IDk5LjYxIDIyLjQyIDk3LjA2IDI1LjAwQzk0LjUyIDI3LjU4IDkwLjUwIDMxLjY5IDg4LjEzIDM0LjEzQzg1Ljc2IDM2LjU3IDgxLjQ2IDQwLjk1IDc4LjU3IDQzLjg4Qzc1LjY4IDQ2LjgwIDcxLjIwIDUxLjM1IDY4LjYyIDU0LjAwQzYxLjE2IDYxLjY2IDM2Ljk2IDg2LjE0IDI0LjI2IDk4Ljg2QzE5LjU2IDEwMy41OCAxNS40NiAxMDcuNzcgMTUuMTYgMTA4LjE4QzEzLjg1IDEwOS45NSAxMi45OCAxMTIuMTkgMTIuNzYgMTE0LjMxQzEyLjY5IDExNS4wNyAxMi42MiAxMjMuNzEgMTIuNjAgMTM2LjI1QzEyLjU2IDE1OS4zOSAxMi40OCAxNTcuMjMgMTMuNDIgMTU4LjIzQzE0LjM0IDE1OS4yMSAxNC4xNiAxNTkuMTkgMjMuMDUgMTU5LjE4TDMwLjQ0IDE1OS4xNyBMMzIuNTYgMTU4LjY0WiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNzcuNDggMTU4LjcyQzE3OC43MiAxNTcuODkgMTc5LjA4IDE1Ni40MCAxNzguMzEgMTU1LjIyQzE3Ny44MSAxNTQuNDYgMTczLjY5IDE1MC4wOCAxNjguNDQgMTQ0Ljc1QzE2NC40MyAxNDAuNjggMTU5LjQ1IDEzNS40OSAxNTUuMzcgMTMxLjEzQzE1NC4zOCAxMzAuMDcgMTUyLjMwIDEyNy45MSAxNTAuNzUgMTI2LjMyQzE0OS4yMCAxMjQuNzMgMTQ2LjM2IDEyMS43NyAxNDQuNDMgMTE5Ljc1QzEzOC4xOCAxMTMuMTkgMTM3LjAwIDExMS45NSAxMzMuMTIgMTA3LjkxQzEzMS4wMiAxMDUuNzMgMTI4LjU0IDEwMy4xMiAxMjcuNjMgMTAyLjEyQzEyNi43MSAxMDEuMTMgMTI0LjA3IDk4LjQwIDEyMS43NiA5Ni4wNUMxMTcuMjcgOTEuNTAgMTE2LjY1IDkxLjAwIDExNS41MCA5MS4wMEMxMTQuMzggOTEuMDAgMTE0LjE0IDkxLjIxIDEwNi4xOSA5OS4xOUM5NS43NiAxMDkuNjUgODcuNjUgMTE3Ljk3IDg3LjMwIDExOC41NkM4Ni42MSAxMTkuNzEgODcuMDEgMTIwLjM1IDkwLjY0IDEyMy45NEM5My4wNCAxMjYuMzIgOTcuNDEgMTMwLjg2IDEwMi45NyAxMzYuNzVDMTA0LjEwIDEzNy45NSAxMDYuNjcgMTQwLjYwIDEwOC42OCAxNDIuNjJDMTEwLjY5IDE0NC42NSAxMTMuMTggMTQ3LjI0IDExNC4yMSAxNDguMzhDMTIwLjE3IDE1NC45MCAxMjEuMDkgMTU1LjcwIDEyNC40NSAxNTcuMjVDMTI2LjAwIDE1Ny45NiAxMjcuMDYgMTU4LjMwIDEyOS43NSAxNTguOTRDMTMwLjMwIDE1OS4wNyAxMzQuOTMgMTU5LjEwIDE1My43MCAxNTkuMDhMMTc2Ljk2IDE1OS4wNiBMMTc3LjQ4IDE1OC43MloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTUuMDYgOTYuMjdDMTUuNzMgOTUuODYgMTcuNjUgOTMuOTYgMjMuMTAgODguMzJDMjYuMDQgODUuMjkgMzMuMDUgNzguMTIgMzguNjkgNzIuMzlDNDkuMjMgNjEuNjcgNTAuMDkgNjAuNzQgNTAuMzggNTkuODRDNTAuNTkgNTkuMTcgNTAuNTcgMTYuNzggNTAuMzUgMTUuOTJDNTAuMTkgMTUuMjQgNDkuNjQgMTQuNjkgNDguODQgMTQuNDFDNDguMjMgMTQuMjAgNDcuNDkgMTQuMTkgMzcuMzEgMTQuMTlMMjYuNDQgMTQuMTkgTDI0Ljk0IDE0LjU0QzE4LjQ1IDE2LjA3IDEzLjYzIDIxLjQzIDEyLjgxIDI4LjAyQzEyLjY1IDI5LjM2IDEyLjYyIDMzLjc3IDEyLjYyIDYyLjI2QzEyLjYyIDgwLjI1IDEyLjY2IDk1LjE1IDEyLjcwIDk1LjM2QzEyLjkxIDk2LjM4IDE0LjEzIDk2Ljg1IDE1LjA2IDk2LjI3WiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=",KR_WORD="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0yIDAgNDEzIDY4Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAgNjYuMCkiPjxwYXRoIGQ9Ik01LjA1NTU1NTU1NTU1NTU1NSAwLjBWLTUxLjk5OTk5OTk5OTk5OTk5SDEyLjYwMjc3Nzc3Nzc3Nzc3NlYtMjcuNzMzMzMzMzMzMzMzMzNMMzQuMzc3Nzc3Nzc3Nzc3NzcgLTUxLjk5OTk5OTk5OTk5OTk5SDQzLjc2NjY2NjY2NjY2NjY2NkwyMC43NjM4ODg4ODg4ODg4ODYgLTI2LjYxMzg4ODg4ODg4ODg4N0w0NS40NjM4ODg4ODg4ODg4OCAwLjBIMzUuNzg2MTExMTExMTExMTA0TDEyLjYwMjc3Nzc3Nzc3Nzc3NiAtMjQuODQ0NDQ0NDQ0NDQ0NDRWMC4wWiBNNjYuNDA4MzMzMzMzMzMzMzIgMC4wVi01MS45OTk5OTk5OTk5OTk5OUg4Ny40MjQ5OTk5OTk5OTk5OFE4OC4xODMzMzMzMzMzMzMzMiAtNTEuOTk5OTk5OTk5OTk5OTkgODkuMzAyNzc3Nzc3Nzc3NzggLTUxLjk0NTgzMzMzMzMzMzMyNlE5MC40MjIyMjIyMjIyMjIyMiAtNTEuODkxNjY2NjY2NjY2NjYgOTEuNDMzMzMzMzMzMzMzMzIgLTUxLjcxMTExMTExMTExMTExUTk1Ljc2NjY2NjY2NjY2NjY1IC01MS4wMjUgOTguNjczNjExMTExMTExMSAtNDguNzVRMTAxLjU4MDU1NTU1NTU1NTU1IC00Ni40NzQ5OTk5OTk5OTk5OTQgMTAzLjAyNDk5OTk5OTk5OTk5IC00My4wMDgzMzMzMzMzMzMzMjZRMTA0LjQ2OTQ0NDQ0NDQ0NDQzIC0zOS41NDE2NjY2NjY2NjY2NjQgMTA0LjQ2OTQ0NDQ0NDQ0NDQzIC0zNS4zNTI3Nzc3Nzc3Nzc3NzRRMTA0LjQ2OTQ0NDQ0NDQ0NDQzIC0yOS4xNDE2NjY2NjY2NjY2NjIgMTAxLjI5MTY2NjY2NjY2NjY2IC0yNC42NjM4ODg4ODg4ODg4ODhROTkuMTYxMTExMTExMTExMSAtMjEuNjMwNTU1NTU1NTU1NTUzIDk1LjYyMjIyMjIyMjIyMjIgLTIwLjE1TDEwNS40NDQ0NDQ0NDQ0NDQ0MyAwLjBIOTYuODEzODg4ODg4ODg4ODdMODcuNzQ5OTk5OTk5OTk5OTkgLTE4LjY2OTQ0NDQ0NDQ0NDQ0NEg3My45NTU1NTU1NTU1NTU1NVYwLjBaTTczLjk1NTU1NTU1NTU1NTU1IC0yNS44MTk0NDQ0NDQ0NDQ0NDNIODcuMTM2MTExMTExMTExMDlRODcuODU4MzMzMzMzMzMzMzIgLTI1LjgxOTQ0NDQ0NDQ0NDQ0MyA4OC43NDMwNTU1NTU1NTU1NCAtMjUuODkxNjY2NjY2NjY2NjY2UTg5LjYyNzc3Nzc3Nzc3Nzc3IC0yNS45NjM4ODg4ODg4ODg4ODUgOTAuNDIyMjIyMjIyMjIyMjIgLTI2LjE0NDQ0NDQ0NDQ0NDQ0MlE5Mi43MzMzMzMzMzMzMzMzMiAtMjYuNjg2MTExMTExMTExMTEgOTQuMTQxNjY2NjY2NjY2NjUgLTI4LjE0ODYxMTExMTExMTExUTk1LjU0OTk5OTk5OTk5OTk4IC0yOS42MTExMTExMTExMTExMDcgOTYuMTYzODg4ODg4ODg4ODggLTMxLjUyNDk5OTk5OTk5OTk5NVE5Ni43Nzc3Nzc3Nzc3Nzc3NyAtMzMuNDM4ODg4ODg4ODg4ODggOTYuNzc3Nzc3Nzc3Nzc3NzcgLTM1LjM1Mjc3Nzc3Nzc3Nzc3NFE5Ni43Nzc3Nzc3Nzc3Nzc3NyAtMzcuMjY2NjY2NjY2NjY2NjY2IDk2LjE2Mzg4ODg4ODg4ODg4IC0zOS4xNjI0OTk5OTk5OTk5OTRROTUuNTQ5OTk5OTk5OTk5OTggLTQxLjA1ODMzMzMzMzMzMzMzIDk0LjE0MTY2NjY2NjY2NjY1IC00Mi41MjA4MzMzMzMzMzMzM1E5Mi43MzMzMzMzMzMzMzMzMiAtNDMuOTgzMzMzMzMzMzMzMzMgOTAuNDIyMjIyMjIyMjIyMjIgLTQ0LjUyNVE4OS42Mjc3Nzc3Nzc3Nzc3NyAtNDQuNzQxNjY2NjY2NjY2NjYgODguNzQzMDU1NTU1NTU1NTQgLTQ0LjgxMzg4ODg4ODg4ODg4UTg3Ljg1ODMzMzMzMzMzMzMyIC00NC44ODYxMTExMTExMTExMDYgODcuMTM2MTExMTExMTExMDkgLTQ0Ljg4NjExMTExMTExMTEwNkg3My45NTU1NTU1NTU1NTU1NVogTTE1MC45ODA1NTU1NTU1NTU1MyAxLjA4MzMzMzMzMzMzMzMzMzNRMTQzLjE4MDU1NTU1NTU1NTU0IDEuMDgzMzMzMzMzMzMzMzMzMyAxMzcuNjkxNjY2NjY2NjY2NjYgLTIuMzI5MTY2NjY2NjY2NjY2NlExMzIuMjAyNzc3Nzc3Nzc3NzUgLTUuNzQxNjY2NjY2NjY2NjY2IDEyOS4yOTU4MzMzMzMzMzMzMiAtMTEuODQ0NDQ0NDQ0NDQ0NDQzUTEyNi4zODg4ODg4ODg4ODg4NyAtMTcuOTQ3MjIyMjIyMjIyMjIgMTI2LjM4ODg4ODg4ODg4ODg3IC0yNS45OTk5OTk5OTk5OTk5OTZRMTI2LjM4ODg4ODg4ODg4ODg3IC0zNC4wNTI3Nzc3Nzc3Nzc3OCAxMjkuMjk1ODMzMzMzMzMzMzIgLTQwLjE1NTU1NTU1NTU1NTU1UTEzMi4yMDI3Nzc3Nzc3Nzc3NSAtNDYuMjU4MzMzMzMzMzMzMzI2IDEzNy42OTE2NjY2NjY2NjY2NiAtNDkuNjcwODMzMzMzMzMzMzNRMTQzLjE4MDU1NTU1NTU1NTU0IC01My4wODMzMzMzMzMzMzMzMyAxNTAuOTgwNTU1NTU1NTU1NTMgLTUzLjA4MzMzMzMzMzMzMzMzUTE1OC43NDQ0NDQ0NDQ0NDQ0IC01My4wODMzMzMzMzMzMzMzMyAxNjQuMjUxMzg4ODg4ODg4ODcgLTQ5LjY3MDgzMzMzMzMzMzMzUTE2OS43NTgzMzMzMzMzMzMzIC00Ni4yNTgzMzMzMzMzMzMzMjYgMTcyLjY0NzIyMjIyMjIyMjE4IC00MC4xNTU1NTU1NTU1NTU1NVExNzUuNTM2MTExMTExMTExMSAtMzQuMDUyNzc3Nzc3Nzc3NzggMTc1LjUzNjExMTExMTExMTEgLTI1Ljk5OTk5OTk5OTk5OTk5NlExNzUuNTM2MTExMTExMTExMSAtMTcuOTQ3MjIyMjIyMjIyMjIgMTcyLjY0NzIyMjIyMjIyMjE4IC0xMS44NDQ0NDQ0NDQ0NDQ0NDNRMTY5Ljc1ODMzMzMzMzMzMzMgLTUuNzQxNjY2NjY2NjY2NjY2IDE2NC4yNTEzODg4ODg4ODg4NyAtMi4zMjkxNjY2NjY2NjY2NjY2UTE1OC43NDQ0NDQ0NDQ0NDQ0IDEuMDgzMzMzMzMzMzMzMzMzMyAxNTAuOTgwNTU1NTU1NTU1NTMgMS4wODMzMzMzMzMzMzMzMzMzWk0xNTAuOTgwNTU1NTU1NTU1NTMgLTYuMTAyNzc3Nzc3Nzc3Nzc3UTE1Ni41MDU1NTU1NTU1NTU1MyAtNi4wMzA1NTU1NTU1NTU1NTUgMTYwLjE3MDgzMzMzMzMzMzMgLTguNTQwMjc3Nzc3Nzc3Nzc4UTE2My44MzYxMTExMTExMTEwOCAtMTEuMDQ5OTk5OTk5OTk5OTk5IDE2NS42Nzc3Nzc3Nzc3Nzc3NSAtMTUuNTQ1ODMzMzMzMzMzMzNRMTY3LjUxOTQ0NDQ0NDQ0NDQyIC0yMC4wNDE2NjY2NjY2NjY2NjQgMTY3LjUxOTQ0NDQ0NDQ0NDQyIC0yNS45OTk5OTk5OTk5OTk5OTZRMTY3LjUxOTQ0NDQ0NDQ0NDQyIC0zMS45NTgzMzMzMzMzMzMzMyAxNjUuNjc3Nzc3Nzc3Nzc3NzUgLTM2LjQxODA1NTU1NTU1NTU1NFExNjMuODM2MTExMTExMTExMDggLTQwLjg3Nzc3Nzc3Nzc3Nzc3IDE2MC4xNzA4MzMzMzMzMzMzIC00My4zNjk0NDQ0NDQ0NDQ0NFExNTYuNTA1NTU1NTU1NTU1NTMgLTQ1Ljg2MTExMTExMTExMTExIDE1MC45ODA1NTU1NTU1NTU1MyAtNDUuODk3MjIyMjIyMjIyMjJRMTQ1LjQ1NTU1NTU1NTU1NTUyIC00NS45Njk0NDQ0NDQ0NDQ0NCAxNDEuNzkwMjc3Nzc3Nzc3NzYgLTQzLjQ3Nzc3Nzc3Nzc3Nzc3NFExMzguMTI0OTk5OTk5OTk5OTcgLTQwLjk4NjExMTExMTExMTExIDEzNi4yODMzMzMzMzMzMzMzIC0zNi40NzIyMjIyMjIyMjIyMTRRMTM0LjQ0MTY2NjY2NjY2NjYzIC0zMS45NTgzMzMzMzMzMzMzMyAxMzQuNDA1NTU1NTU1NTU1NTQgLTI1Ljk5OTk5OTk5OTk5OTk5NlExMzQuMzY5NDQ0NDQ0NDQ0NCAtMjAuMDQxNjY2NjY2NjY2NjY0IDEzNi4yMTExMTExMTExMTEwOCAtMTUuNTgxOTQ0NDQ0NDQ0NDQyUTEzOC4wNTI3Nzc3Nzc3Nzc3NSAtMTEuMTIyMjIyMjIyMjIyMjIyIDE0MS43NTQxNjY2NjY2NjY2MyAtOC42MzA1NTU1NTU1NTU1NTVRMTQ1LjQ1NTU1NTU1NTU1NTUyIC02LjEzODg4ODg4ODg4ODg4OCAxNTAuOTgwNTU1NTU1NTU1NTMgLTYuMTAyNzc3Nzc3Nzc3Nzc3WiBNMTk4LjY0NzIyMjIyMjIyMjE4IDAuMFYtNTEuOTk5OTk5OTk5OTk5OTlIMjA2LjMwMjc3Nzc3Nzc3Nzc1TDIzMS45MDU1NTU1NTU1NTU1IC0xMy4zNjExMTExMTExMTExMVYtNTEuOTk5OTk5OTk5OTk5OTlIMjM5LjU2MTExMTExMTExMTA3VjAuMEgyMzEuOTA1NTU1NTU1NTU1NUwyMDYuMzAyNzc3Nzc3Nzc3NzUgLTM4LjY3NVYwLjBaIiBmaWxsPSIjZmZmZmZmIi8+PHJlY3QgeD0iMjY2LjMiIHk9Ii0zNC4zIiB3aWR0aD0iNy41IiBoZWlnaHQ9IjM0LjMiIHJ4PSIwLjkiIGZpbGw9IiNmZmZmZmYiLz48Y2lyY2xlIGN4PSIyNzAuMSIgY3k9Ii00Ni4wIiByPSI2LjAiIGZpbGw9IiNmZjdhOGMiLz48cGF0aCBkPSJNMzIxLjI4MDU1NTU1NTU1NTU3IDEuMDgzMzMzMzMzMzMzMzMzM1EzMTUuMTc3Nzc3Nzc3Nzc3NzUgMS4wODMzMzMzMzMzMzMzMzMzIDMxMC41MDEzODg4ODg4ODg4NyAtMS40MjYzODg4ODg4ODg4ODlRMzA1LjgyNSAtMy45MzYxMTExMTExMTExMTEgMzAzLjE4ODg4ODg4ODg4ODg3IC04LjQ2ODA1NTU1NTU1NTU1NVEzMDAuNTUyNzc3Nzc3Nzc3NzUgLTEyLjk5OTk5OTk5OTk5OTk5OCAzMDAuNTUyNzc3Nzc3Nzc3NzUgLTE5LjEzODg4ODg4ODg4ODg4NlYtNTEuOTYzODg4ODg4ODg4ODhMMzA4LjIwODMzMzMzMzMzMzMgLTUxLjk5OTk5OTk5OTk5OTk5Vi0xOS41MzYxMTExMTExMTExMDhRMzA4LjIwODMzMzMzMzMzMzMgLTE2LjIxMzg4ODg4ODg4ODg5IDMwOS4zMjc3Nzc3Nzc3Nzc4IC0xMy42ODYxMTExMTExMTExMVEzMTAuNDQ3MjIyMjIyMjIyMiAtMTEuMTU4MzMzMzMzMzMzMzMxIDMxMi4zMjUgLTkuNDYxMTExMTExMTExMTFRMzE0LjIwMjc3Nzc3Nzc3NzggLTcuNzYzODg4ODg4ODg4ODg4IDMxNi41MzE5NDQ0NDQ0NDQ0MyAtNi44OTcyMjIyMjIyMjIyMjJRMzE4Ljg2MTExMTExMTExMTEgLTYuMDMwNTU1NTU1NTU1NTU1IDMyMS4yODA1NTU1NTU1NTU1NyAtNi4wMzA1NTU1NTU1NTU1NTVRMzIzLjczNjExMTExMTExMTEgLTYuMDMwNTU1NTU1NTU1NTU1IDMyNi4wNjUyNzc3Nzc3Nzc3NCAtNi45MTUyNzc3Nzc3Nzc3NzdRMzI4LjM5NDQ0NDQ0NDQ0NDQ1IC03Ljc5OTk5OTk5OTk5OTk5OSAzMzAuMjcyMjIyMjIyMjIyMjQgLTkuNDk3MjIyMjIyMjIyMjJRMzMyLjE1IC0xMS4xOTQ0NDQ0NDQ0NDQ0NDMgMzMzLjI1MTM4ODg4ODg4ODg3IC0xMy43MjIyMjIyMjIyMjIyMjFRMzM0LjM1Mjc3Nzc3Nzc3Nzc2IC0xNi4yNSAzMzQuMzUyNzc3Nzc3Nzc3NzYgLTE5LjUzNjExMTExMTExMTEwOFYtNTEuOTk5OTk5OTk5OTk5OTlIMzQyLjAwODMzMzMzMzMzMzNWLTE5LjEzODg4ODg4ODg4ODg4NlEzNDIuMDA4MzMzMzMzMzMzMyAtMTMuMDM2MTExMTExMTExMTEgMzM5LjM3MjIyMjIyMjIyMjIgLTguNDg2MTExMTExMTExMTFRMzM2LjczNjExMTExMTExMTEgLTMuOTM2MTExMTExMTExMTExIDMzMi4wNTk3MjIyMjIyMjIyIC0xLjQyNjM4ODg4ODg4ODg4OVEzMjcuMzgzMzMzMzMzMzMzMyAxLjA4MzMzMzMzMzMzMzMzMzMgMzIxLjI4MDU1NTU1NTU1NTU3IDEuMDgzMzMzMzMzMzMzMzMzM1ogTTM4Ni44NTgzMzMzMzMzMzMzNSAxLjA4MzMzMzMzMzMzMzMzMzNRMzgxLjI2MTExMTExMTExMTEgMS4wODMzMzMzMzMzMzMzMzMzIDM3Ni43NjUyNzc3Nzc3Nzc4IC0wLjg0ODYxMTExMTExMTExMTFRMzcyLjI2OTQ0NDQ0NDQ0NDQ1IC0yLjc4MDU1NTU1NTU1NTU1NTQgMzY5LjM2MjUgLTYuMzczNjExMTExMTExMTFRMzY2LjQ1NTU1NTU1NTU1NTYgLTkuOTY2NjY2NjY2NjY2NjY1IDM2NS41ODg4ODg4ODg4ODg5IC0xNC45MTM4ODg4ODg4ODg4ODhMMzczLjQ2MTExMTExMTExMTEgLTE2LjEwNTU1NTU1NTU1NTU1NFEzNzQuNjUyNzc3Nzc3Nzc3NzcgLTExLjMzODg4ODg4ODg4ODg4OSAzNzguNDQ0NDQ0NDQ0NDQ0NDYgLTguNjg0NzIyMjIyMjIyMjIyUTM4Mi4yMzYxMTExMTExMTExIC02LjAzMDU1NTU1NTU1NTU1NSAzODcuMjkxNjY2NjY2NjY2NyAtNi4wMzA1NTU1NTU1NTU1NTVRMzkwLjQzMzMzMzMzMzMzMzM0IC02LjAzMDU1NTU1NTU1NTU1NSAzOTMuMDY5NDQ0NDQ0NDQ0NDYgLTcuMDIzNjExMTExMTExMTFRMzk1LjcwNTU1NTU1NTU1NTYgLTguMDE2NjY2NjY2NjY2NjY2IDM5Ny4zMTI1IC05Ljg3NjM4ODg4ODg4ODg4OFEzOTguOTE5NDQ0NDQ0NDQ0NCAtMTEuNzM2MTExMTExMTExMTEgMzk4LjkxOTQ0NDQ0NDQ0NDQgLTE0LjMzNjExMTExMTExMTExUTM5OC45MTk0NDQ0NDQ0NDQ0IC0xNS43NDQ0NDQ0NDQ0NDQ0NDQgMzk4LjQzMTk0NDQ0NDQ0NDQgLTE2LjgyNzc3Nzc3Nzc3Nzc3NlEzOTcuOTQ0NDQ0NDQ0NDQ0NDYgLTE3LjkxMTExMTExMTExMTEwOCAzOTcuMDk1ODMzMzMzMzMzMyAtMTguNzIzNjExMTExMTExMTA4UTM5Ni4yNDcyMjIyMjIyMjIyIC0xOS41MzYxMTExMTExMTExMDggMzk1LjAzNzUgLTIwLjEzMTk0NDQ0NDQ0NDQ0M1EzOTMuODI3Nzc3Nzc3Nzc3OCAtMjAuNzI3Nzc3Nzc3Nzc3Nzc0IDM5Mi4zODMzMzMzMzMzMzMzIC0yMS4xNjExMTExMTExMTExMDhMMzc5LjA1ODMzMzMzMzMzMzM0IC0yNS4wOTcyMjIyMjIyMjIyMlEzNzcuMTA4MzMzMzMzMzMzMzUgLTI1LjY3NDk5OTk5OTk5OTk5NyAzNzUuMDg2MTExMTExMTExMSAtMjYuNTk1ODMzMzMzMzMzMzNRMzczLjA2Mzg4ODg4ODg4ODg3IC0yNy41MTY2NjY2NjY2NjY2NjYgMzcxLjM4NDcyMjIyMjIyMjIgLTI5LjAxNTI3Nzc3Nzc3Nzc3NlEzNjkuNzA1NTU1NTU1NTU1NiAtMzAuNTEzODg4ODg4ODg4ODg2IDM2OC42NTgzMzMzMzMzMzMzNiAtMzIuNzM0NzIyMjIyMjIyMjJRMzY3LjYxMTExMTExMTExMTE0IC0zNC45NTU1NTU1NTU1NTU1NTYgMzY3LjYxMTExMTExMTExMTE0IC0zOC4xMzMzMzMzMzMzMzMzM1EzNjcuNjExMTExMTExMTExMTQgLTQyLjkzNjExMTExMTExMTExIDM3MC4wODQ3MjIyMjIyMjIyNCAtNDYuMjc2Mzg4ODg4ODg4ODlRMzcyLjU1ODMzMzMzMzMzMzM0IC00OS42MTY2NjY2NjY2NjY2NiAzNzYuNzgzMzMzMzMzMzMzMyAtNTEuMzMxOTQ0NDQ0NDQ0NDRRMzgxLjAwODMzMzMzMzMzMzMgLTUzLjA0NzIyMjIyMjIyMjIyIDM4Ni4yNDQ0NDQ0NDQ0NDQ0NyAtNTMuMDQ3MjIyMjIyMjIyMjJRMzkxLjUxNjY2NjY2NjY2NjY1IC01Mi45NzQ5OTk5OTk5OTk5OTQgMzk1LjY4NzUgLTUxLjE2OTQ0NDQ0NDQ0NDQ0UTM5OS44NTgzMzMzMzMzMzMzNSAtNDkuMzYzODg4ODg4ODg4ODkgNDAyLjYyMDgzMzMzMzMzMzM0IC00NS45ODc1UTQwNS4zODMzMzMzMzMzMzMzIC00Mi42MTExMTExMTExMTExMSA0MDYuNDMwNTU1NTU1NTU1NTQgLTM3LjgwODMzMzMzMzMzMzMzTDM5OC4zNDE2NjY2NjY2NjY3IC0zNi40MzYxMTExMTExMTExMVEzOTcuOCAtMzkuMzYxMTExMTExMTExMTEgMzk2LjAzMDU1NTU1NTU1NTU3IC00MS40NzM2MTExMTExMTExMVEzOTQuMjYxMTExMTExMTExMSAtNDMuNTg2MTExMTExMTExMTEgMzkxLjY5NzIyMjIyMjIyMjIgLTQ0LjcyMzYxMTExMTExMTExUTM4OS4xMzMzMzMzMzMzMzMzIC00NS44NjExMTExMTExMTExMSAzODYuMTM2MTExMTExMTExMSAtNDUuODk3MjIyMjIyMjIyMjJRMzgzLjI0NzIyMjIyMjIyMjIgLTQ1Ljk2OTQ0NDQ0NDQ0NDQ0IDM4MC44NDU4MzMzMzMzMzMzIC00NS4wMzA1NTU1NTU1NTU1NVEzNzguNDQ0NDQ0NDQ0NDQ0NDYgLTQ0LjA5MTY2NjY2NjY2NjY2IDM3Ny4wMTgwNTU1NTU1NTU2IC00Mi4zOTQ0NDQ0NDQ0NDQ0NFEzNzUuNTkxNjY2NjY2NjY2NyAtNDAuNjk3MjIyMjIyMjIyMjE2IDM3NS41OTE2NjY2NjY2NjY3IC0zOC40OTQ0NDQ0NDQ0NDQ0NFEzNzUuNTkxNjY2NjY2NjY2NyAtMzYuMzI3Nzc3Nzc3Nzc3Nzc2IDM3Ni44NTU1NTU1NTU1NTU2IC0zNC45OTE2NjY2NjY2NjY2NlEzNzguMTE5NDQ0NDQ0NDQ0NDcgLTMzLjY1NTU1NTU1NTU1NTU1IDM3OS45NzkxNjY2NjY2NjY3IC0zMi44NzkxNjY2NjY2NjY2NlEzODEuODM4ODg4ODg4ODg4OSAtMzIuMTAyNzc3Nzc3Nzc3Nzc0IDM4My42ODA1NTU1NTU1NTU1NCAtMzEuNTk3MjIyMjIyMjIyMjE4TDM5My4yODYxMTExMTExMTExIC0yOC44ODg4ODg4ODg4ODg4ODZRMzk1LjA5MTY2NjY2NjY2NjcgLTI4LjM4MzMzMzMzMzMzMzMzIDM5Ny4zODQ3MjIyMjIyMjIyNSAtMjcuNTM0NzIyMjIyMjIyMjJRMzk5LjY3Nzc3Nzc3Nzc3NzggLTI2LjY4NjExMTExMTExMTExIDQwMS44MjYzODg4ODg4ODg5IC0yNS4xNjk0NDQ0NDQ0NDQ0NDRRNDAzLjk3NSAtMjMuNjUyNzc3Nzc3Nzc3Nzc1IDQwNS4zODMzMzMzMzMzMzMzIC0yMS4xNDMwNTU1NTU1NTU1NTZRNDA2Ljc5MTY2NjY2NjY2NjcgLTE4LjYzMzMzMzMzMzMzMzMzMyA0MDYuNzkxNjY2NjY2NjY2NyAtMTQuODQxNjY2NjY2NjY2NjY1UTQwNi43OTE2NjY2NjY2NjY3IC0xMC45MDU1NTU1NTU1NTU1NTUgNDA1LjIwMjc3Nzc3Nzc3NzggLTcuOTI2Mzg4ODg4ODg4ODg5UTQwMy42MTM4ODg4ODg4ODg5IC00Ljk0NzIyMjIyMjIyMjIyMiA0MDAuODUxMzg4ODg4ODg4OSAtMi45NDMwNTU1NTU1NTU1NTU1UTM5OC4wODg4ODg4ODg4ODg5IC0wLjkzODg4ODg4ODg4ODg4ODggMzk0LjQ3Nzc3Nzc3Nzc3Nzc2IDAuMDcyMjIyMjIyMjIyMjIyMjRRMzkwLjg2NjY2NjY2NjY2NjcgMS4wODMzMzMzMzMzMzMzMzMzIDM4Ni44NTgzMzMzMzMzMzMzNSAxLjA4MzMzMzMzMzMzMzMzMzNaIiBmaWxsPSIjZmZmZmZmIi8+PC9nPjwvc3ZnPg==";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const CSS=`
  @page{size:A4 portrait;margin:14mm 12mm 16mm}
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;color:#303238;font:11px/1.45 Inter,-apple-system,"Segoe UI",Arial,sans-serif;background:#ffffff}
  .doc-head{position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:22px 26px 20px;border-radius:14px;color:#ffffff;background:radial-gradient(ellipse at 92% 8%,rgba(214,79,97,.38),transparent 46%),linear-gradient(135deg,#250307 0%,#46060f 55%,#600915 100%)}
  .doc-head:after{content:"";position:absolute;right:-70px;bottom:-95px;width:300px;height:190px;border:1px solid rgba(229,172,180,.35);border-radius:50%;transform:rotate(-24deg)}
  .doc-brand{position:relative;z-index:1}
  .doc-lockup{display:flex;align-items:center;gap:9px}.doc-tile{width:30px;height:30px}.doc-word{height:15px;border-left:1px solid rgba(255,255,255,.45);padding-left:9px;box-sizing:content-box}
  .doc-wordmark{font-size:22px;font-weight:800;letter-spacing:-.8px;line-height:1}
  .doc-wordmark span{color:#e5acb4}
  .doc-tagline{margin-top:5px;color:#eaced2;font-size:8px;letter-spacing:1.7px;text-transform:uppercase}
  .doc-title{position:relative;z-index:1;text-align:right;max-width:62%}
  .doc-kicker{margin:0 0 4px;color:#e5acb4;font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
  .doc-title h1{margin:0;font-size:21px;font-weight:800;letter-spacing:-.6px;line-height:1.15}
  .doc-title p{margin:5px 0 0;color:#efdddf;font-size:10px}
  .doc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0 0}
  .doc-meta div{padding:9px 12px;border:1px solid #e4e4e4;border-radius:10px;background:#f8f8f8}
  .doc-meta small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase}
  .doc-meta strong{display:block;margin-top:3px;color:#303238;font-size:11px}
  .doc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:12px 0 4px}
  .doc-kpi{padding:11px 13px;border-radius:11px;border:1px solid #e4e4e4;border-left:3px solid #881423;background:linear-gradient(145deg,#ffffff,#f6f6f6)}
  .doc-kpi small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
  .doc-kpi strong{display:block;margin-top:4px;color:#303238;font-size:17px;font-weight:800;letter-spacing:-.5px}
  .doc-kpi.pos{border-left-color:#2f7d57}.doc-kpi.pos strong{color:#1f6a46}
  .doc-kpi.neg{border-left-color:#b62438}.doc-kpi.neg strong{color:#b62438}
  .doc-section{margin-top:18px;break-inside:auto}
  .doc-section h2{display:flex;align-items:center;gap:8px;margin:0 0 3px;color:#303238;font-size:13px;font-weight:800;letter-spacing:-.2px;break-after:avoid}
  .doc-section h2:before{content:"";width:4px;height:15px;border-radius:3px;background:linear-gradient(180deg,#d64f61,#881423)}
  .doc-section .note{margin:0 0 7px 12px;color:#7c7f8b;font-size:9px;break-after:avoid}
  table{width:100%;border-collapse:separate;border-spacing:0;margin-top:6px;font-size:9.5px}
  thead{display:table-header-group}
  th{padding:8px 9px;background:#f2f2f2;color:#6f0d1a;font-size:7.5px;font-weight:800;letter-spacing:1px;text-align:left;text-transform:uppercase;border-top:1px solid #efe1e3;border-bottom:1px solid #efe1e3}
  th:first-child{border-left:1px solid #efe1e3;border-radius:8px 0 0 0}th:last-child{border-right:1px solid #efe1e3;border-radius:0 8px 0 0}
  td{padding:7px 9px;border-bottom:1px solid #ebebeb;color:#303238;vertical-align:top}
  tbody tr{break-inside:avoid}
  tbody tr:nth-child(even) td{background:#fafafa}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  td.strong{font-weight:800;color:#303238}
  td.pos{color:#1f6a46;font-weight:800}td.neg{color:#b62438;font-weight:800}
  td.muted{color:#8a8d97}
  .empty{padding:18px;border:1px dashed #dadada;border-radius:10px;color:#7c7f8b;text-align:center}
  .signatures{display:grid;grid-template-columns:1fr 1fr;gap:46px;margin-top:54px;break-inside:avoid}
  .signatures div{padding-top:7px;border-top:1px solid #5e6069;color:#5e6069;font-size:9px;text-align:center}
  .doc-foot{display:flex;justify-content:space-between;gap:12px;margin-top:26px;padding-top:8px;border-top:1px solid #e4e4e4;color:#8a8d97;font-size:9px}
  .doc-foot b{color:#881423}
  @media screen{body{max-width:980px;margin:26px auto;padding:0 22px}}
  @media print{.doc-foot{display:none}}
  `;

  function fmtDate(iso){return iso?new Date(iso+"T12:00:00").toLocaleDateString("pt-BR"):""}

  function tableHtml(headers,rows,opts={}){
    const num=new Set(opts.numeric||[]),strong=new Set(opts.strong||[]),muted=new Set(opts.muted||[]);
    const th=headers.map((h,i)=>'<th'+(num.has(i)?' class="num"':'')+'>'+esc(h)+'</th>').join("");
    const body=rows.map(r=>'<tr>'+r.map((c,i)=>{
      let cls=[];if(num.has(i))cls.push("num");if(strong.has(i))cls.push("strong");if(muted.has(i))cls.push("muted");
      const text=String(c??"");
      if(opts.tone&&opts.tone.includes(i)){if(/^[−-]/.test(text)&&text!=="—")cls.push("neg");else if(/^\+/.test(text)||(text&&text!=="00:00"&&text!=="—"&&opts.tonePositiveIfPlain))cls.push("pos");}
      return '<td'+(cls.length?' class="'+cls.join(" ")+'"':'')+'>'+esc(c)+'</td>';
    }).join("")+'</tr>').join("");
    return '<table><thead><tr>'+th+'</tr></thead><tbody>'+(rows.length?body:'<tr><td colspan="'+headers.length+'" class="muted" style="text-align:center;padding:16px">Sem registros para exibir.</td></tr>')+'</tbody></table>';
  }

  // Lê uma <table> do DOM e devolve cabeçalhos e linhas em texto
  function readTable(table){
    const headers=[...table.querySelectorAll("thead th")].map(th=>th.innerText.trim());
    const rows=[...table.querySelectorAll("tbody tr")].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g," ").trim()));
    return {headers,rows};
  }

  function buildHtml(o){
    const meta=(o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="");
    const kpis=(o.kpis||[]);
    const sections=(o.sections||[]);
    const now=new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const boxes='@page{@bottom-left{content:"Kronius · KR Contábil · Documento gerado pelo sistema";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}@bottom-center{content:"Página " counter(page) " de " counter(pages);font:700 7.5px Inter,Arial,sans-serif;color:#881423}@bottom-right{content:"Emitido em '+now+'";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}}';
    const page=boxes+(o.landscape?"@page{size:A4 landscape;margin:12mm 12mm 15mm}":"");
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>'+esc(o.title)+' · Kronius</title><style>'+CSS+page+'</style></head><body>'+
      '<header class="doc-head"><div class="doc-brand"><div class="doc-lockup"><img class="doc-tile" src="'+KR_TILE+'" alt=""><img class="doc-word" src="'+KR_WORD+'" alt="Kronius"></div><div class="doc-tagline">Gestão de Pessoas, de um jeito mais inteligente</div></div><div class="doc-title"><p class="doc-kicker">'+esc(o.kicker||"Gestão de jornada")+'</p><h1>'+esc(o.title)+'</h1>'+(o.subtitle?'<p>'+esc(o.subtitle)+'</p>':'')+'</div></header>'+
      (meta.length?'<div class="doc-meta">'+meta.map(([k,v])=>'<div><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join("")+'</div>':'')+
      (kpis.length?'<div class="doc-kpis">'+kpis.map(k=>'<div class="doc-kpi '+(k[2]||"")+'"><small>'+esc(k[0])+'</small><strong>'+esc(k[1])+'</strong></div>').join("")+'</div>':'')+
      sections.map(s=>'<section class="doc-section">'+(s.title?'<h2>'+esc(s.title)+'</h2>':'')+(s.note?'<p class="note">'+esc(s.note)+'</p>':'')+(s.html||'')+'</section>').join("")+
      (o.signatures?'<div class="signatures"><div>'+esc(o.signatures[0]||"Assinatura do funcionário")+'</div><div>'+esc(o.signatures[1]||"Responsável pela empresa")+'</div></div>':'')+
      '<footer class="doc-foot"><span><b>Kronius</b> · KR Contábil · Documento gerado pelo sistema</span><span>Emitido em '+esc(now)+'</span></footer>'+
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},350)})<'+'/script></body></html>';
  }

  function openPdf(o){
    const w=window.open("","_blank");
    if(!w){return false;}
    w.document.write(buildHtml(o));w.document.close();return true;
  }

  // Excel com título, metadados e larguras de coluna
  function saveExcel(o){
    if(!window.XLSX)return false;
    const wb=XLSX.utils.book_new();
    const used=new Set();
    (o.sheets||[]).forEach((sh,i)=>{
      const head=[["KRONIUS · "+(o.title||"Relatório")]];
      (o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="").forEach(([k,v])=>head.push([k,v]));
      head.push([]);
      const aoa=[...head,sh.headers,...sh.rows];
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      const widths=sh.headers.map((h,c)=>({wch:Math.min(46,Math.max(String(h).length+4,...sh.rows.map(r=>String(r[c]??"").length+2),12))}));
      ws["!cols"]=widths;
      ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:Math.max(1,sh.headers.length-1)}}];
      ws["!autofilter"]={ref:XLSX.utils.encode_range({s:{r:head.length,c:0},e:{r:head.length+sh.rows.length,c:Math.max(0,sh.headers.length-1)}})};
      let name=String(sh.name||("Planilha "+(i+1))).replace(/[\\\/?*\[\]:]/g," ").slice(0,28)||"Planilha";
      let base=name,n=2;while(used.has(name.toLowerCase())){name=base.slice(0,25)+" "+n++;}
      used.add(name.toLowerCase());
      XLSX.utils.book_append_sheet(wb,ws,name);
    });
    XLSX.writeFile(wb,o.filename||"Kronius-relatorio.xlsx");
    return true;
  }

  window.PontoDocs={esc,tableHtml,readTable,openPdf,saveExcel,fmtDate};
})();
