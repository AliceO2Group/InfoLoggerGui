# Help and tips for InfoLoggerGui

## General

The InfoLoggerGui let you explore logs in real-time with the "Live" mode and the logs stored inside a database on "Query" mode. Both modes can be filtered per field (hostname, run, date, ...) to view less logs until you find what you are looking for.

For many buttons, some shortcuts are provided to let work quicker, keep your mouse on top of it to know them. For exemple, press enter anywhere for querying, press escape to stop loading, use arrows to navigate through logs (previous/next = top/down) or to navigate through errors (left/right).

Each part has its functions, see bellow.

Bug? Improvement? vladimir.kosmala@cern.ch

## Filters

On top of the screen you have the filters. The first line tell you which column, one click on it hide or display the column in the Logs view.

The next line is search by "match", the field must be equal to what you type (hostname = 'pcalice' for example), each space is considered as a "OR", so a match for "pcalice-1 pcalice-2" will request hostname = 'pcalice-1' OR hostname = 'pcalice-2'. The next and last line, exclude, is the opposite, the log must not match this field value. Except for logs without anyvalue, they are excluded only is there is a value and it does not match, like this: hostname = 'pcalice-1' AND hostname != NULL.

The date can't be matched or excluded, it's a range from a date to another. The datepicker will help you write quickly a date, see the help inside it. The arguments inside brackets ([...]) are facultative. For example, [hh:[mm[:ss]]] means you can put nothing, or put just an hour followed by a double point like this: "21:", this will be understood as an hour. You can then add minutes and seconds if you want. Keep in mind two things, double point is for time (hh:) and slash is for date (dd/). Just add as many argument as you want to be precise. At the end, just check the result on top of the datepicker. The relative time syntax can be useful if your date is relative to now. Like, what happened for one hour? Just type "-1h" and press enter.

## Commands

The bar under the filters let you set the main filters (level: shift, oncall, ...), set how many logs you want to be loaded, browse the errors with the arrows and begin a mode: query or live. If a query takes too much time, you can click again and it will stop the request.

You should set to 1k the number of logs to load, it will be quicker, use the filters to have less logs.

The buttons on the right allow you to hide inspector if you need space or the minimap if you have performance issue when scrolling.

## Logs

The main view show the logs loaded. The columns can be added or removed, see the Filters part. They can't be resized but are optimized for there content, if you want to see a big content (like messages), click on the row and open the inspector on the right. Then use the arrows (top/down) to navigate or scroll like usual. You can also use the minimap which replaces the scrollbar, it will provide an overview of the logs loaded with colored lines depending of their severity: red for errors, yellow for warnings, etc.

If you load 100k logs, you can encounter some performance issues, to gain fluidity you can disable the minimap and columns.

You will not be able to search with CTRL+F like in a normal page, use the filters for this action.

## Inspector

The inspector is the best way to see every field from a row and have more information on it thanks to the link to the wiki error code.

You can copy the entire log details and share it by email for example. The entire table is copied, if you paste inside a Word document or an HTML email, it will be printed like in the app (gray table), just press CTRL+SHIFT+V to paste only text.

You can quick search from the properties displayed inside the inspector, move the mouse hover an property and click on the magnifying glass icon, this will set the value inside the corresponding match filter and erase the privious value. A click on a datetime will put an absolute value inside the "from" filter, this is good if you want all logs starting from the log you are looking at.

## Status

The number of logs loaded is displayed on the bottom bar. This provides also some statistics like the number of errors, the time spent to load a query or how many logs are not loaded if your filter is not enough. On the right side is the real-time connection to the server providing this app, if it's disconnected it means the network or server are dead.
