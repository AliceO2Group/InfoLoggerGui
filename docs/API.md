## Classes

<dl>
<dt><a href="#App">App</a></dt>
<dd><p>App model containing all data, methods, ajax calls of this application
It runs on its own and views can &#39;observe&#39; for changes to redraw.</p>
</dd>
<dt><a href="#Observable">Observable</a></dt>
<dd><p>Simple Observable class to notify others listening for changes</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#_autoScrollOnLive">_autoScrollOnLive(argName)</a> ⇒ <code>string</code></dt>
<dd><p>On live mode when new rows are coming and auto-scroll is on, scroll-down</p>
</dd>
<dt><a href="#_autoScrollOnReset">_autoScrollOnReset()</a></dt>
<dd><p>Auto-scroll top on logs reference change
for example when we clean and add new rows, just scroll top</p>
</dd>
<dt><a href="#_autoScrollOnSelected">_autoScrollOnSelected()</a></dt>
<dd><p>Auto-scroll to selected row:
A row is selected and it was not the case earlier,
so let&#39;s scroll to it if not in the screen!</p>
</dd>
<dt><a href="#_computeTablePosition">_computeTablePosition()</a></dt>
<dd><p>Fake big scroll
Only dozen of rows are actually displayed in the table inside a big DIV scrolling
so we need to calculate the position of the table inside it
this is made for performance, DOM cannot handle 50k nodes</p>
</dd>
</dl>

<a name="App"></a>

## App
App model containing all data, methods, ajax calls of this application
It runs on its own and views can 'observe' for changes to redraw.

**Kind**: global class  

* [App](#App)
    * [new App()](#new_App_new)
    * [.reconnect()](#App+reconnect)
    * [.query()](#App+query) ⇒ <code>xhr</code>
    * [.live(enabled)](#App+live) ⇒ <code>bool</code>
    * [.onLiveMessage(log)](#App+onLiveMessage)
    * [.empty()](#App+empty)
    * [.displayField(fieldName, value)](#App+displayField) ⇒ <code>bool</code>
    * [.rawFilters(rawFilters)](#App+rawFilters)
    * [.rawFilter(field, operator, value)](#App+rawFilter) ⇒ <code>string</code>
    * [.parsedFilters(field, operator)](#App+parsedFilters) ⇒ <code>string</code> \| <code>date</code> \| <code>number</code>
    * [.selected(row)](#App+selected) ⇒ <code>object</code>
    * [.moveSelected(n)](#App+moveSelected)
    * [.moveSelectedError(n)](#App+moveSelectedError)
    * [.logs(log(s), append)](#App+logs) ⇒ <code>array</code>
    * [.inspector(activated)](#App+inspector) ⇒ <code>bool</code>
    * [.autoScroll(enabled)](#App+autoScroll) ⇒ <code>bool</code>
    * [.max(max)](#App+max) ⇒ <code>Number</code>

<a name="new_App_new"></a>

### new App()
Constructor, declares default properties and init Observable super class

<a name="App+reconnect"></a>

### app.reconnect()
Reconnect ws when connection is lost, 2s between tries

**Kind**: instance method of [<code>App</code>](#App)  
<a name="App+query"></a>

### app.query() ⇒ <code>xhr</code>
Query server for logs stored in DB

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>xhr</code> - jquery ajax instance  
<a name="App+live"></a>

### app.live(enabled) ⇒ <code>bool</code>
Getter/setter of live mode state, if argument is provided it tells the server to start/stop
sending logs by websocket

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>bool</code> - live mode state  

| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>bool</code> | (optional) start/stop live mode |

<a name="App+onLiveMessage"></a>

### app.onLiveMessage(log)
Inserts log into list and notify observers

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| log | <code>string</code> | log object to be inserted |

<a name="App+empty"></a>

### app.empty()
Empty all logs stored

**Kind**: instance method of [<code>App</code>](#App)  
<a name="App+displayField"></a>

### app.displayField(fieldName, value) ⇒ <code>bool</code>
Getter/setter if a field should be displayed or not

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>bool</code> - if should be displayed  

| Param | Type | Description |
| --- | --- | --- |
| fieldName | <code>string</code> | field to be set |
| value | <code>boolean</code> | display or not |

<a name="App+rawFilters"></a>

### app.rawFilters(rawFilters)
Set many raw filters from an object, because it calls rawFilter, parsed filters
will be setted too, it must be used to load any filter from outside model

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| rawFilters | <code>object</code> | field->operator |

<a name="App+rawFilter"></a>

### app.rawFilter(field, operator, value) ⇒ <code>string</code>
Getter/setter for input field, this also update the parsed/casted filters

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>string</code> - always a string, to show to user  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | name of the column |
| operator | <code>string</code> | criteria to apply to the column |
| value | <code>string</code> | the string given by user |

<a name="App+parsedFilters"></a>

### app.parsedFilters(field, operator) ⇒ <code>string</code> \| <code>date</code> \| <code>number</code>
Getter for the parsed filters

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>string</code> \| <code>date</code> \| <code>number</code> - the parsed value associated to this filter  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | name of the column |
| operator | <code>string</code> | criteria to apply to the column |

<a name="App+selected"></a>

### app.selected(row) ⇒ <code>object</code>
Getter/setter for the row selected in the table, we use virtualId as an id

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>object</code> - the row selected or null  

| Param | Type | Description |
| --- | --- | --- |
| row | <code>object</code> \| <code>string</code> | the row to be selected, or its virtualId |

<a name="App+moveSelected"></a>

### app.moveSelected(n)
Move current cursor by `n` rows

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>Number</code> | can be negative or positive |

<a name="App+moveSelectedError"></a>

### app.moveSelectedError(n)
Move current cursor by `n` rows, but only errors

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>Number</code> | negative or positive number, Infinity for first and last error |

<a name="App+logs"></a>

### app.logs(log(s), append) ⇒ <code>array</code>
Getter/setter for logs, can append with second arg

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>array</code> - logs in memory  

| Param | Type | Description |
| --- | --- | --- |
| log(s) | <code>array</code> \| <code>object</code> | the new log(s) |
| append | <code>bool</code> | just push on last position and truncate if needed |

<a name="App+inspector"></a>

### app.inspector(activated) ⇒ <code>bool</code>
Getter/setter for the inspector

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>bool</code> - if the inspector is enabled or not  

| Param | Type | Description |
| --- | --- | --- |
| activated | <code>bool</code> | state of the inspector |

<a name="App+autoScroll"></a>

### app.autoScroll(enabled) ⇒ <code>bool</code>
Getter/setter for the auto-scroll

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>bool</code> - if the auto-scroll is enabled or not  

| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>bool</code> | state of auto-scroll |

<a name="App+max"></a>

### app.max(max) ⇒ <code>Number</code>
Getter/setter for the max number of logs loaded in memory

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>Number</code> - how many logs  

| Param | Type | Description |
| --- | --- | --- |
| max | <code>Number</code> | how many logs |

<a name="Observable"></a>

## Observable
Simple Observable class to notify others listening for changes

**Kind**: global class  

* [Observable](#Observable)
    * [.observe(callback)](#Observable+observe)
    * [.unobserve(callback)](#Observable+unobserve)
    * [.notify()](#Observable+notify)

<a name="Observable+observe"></a>

### observable.observe(callback)
Add an observer

**Kind**: instance method of [<code>Observable</code>](#Observable)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | will be called for each notification |

<a name="Observable+unobserve"></a>

### observable.unobserve(callback)
Remove an observer

**Kind**: instance method of [<code>Observable</code>](#Observable)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | the callback to remove |

<a name="Observable+notify"></a>

### observable.notify()
Notify every observer that something changed

**Kind**: instance method of [<code>Observable</code>](#Observable)  
<a name="_autoScrollOnLive"></a>

## _autoScrollOnLive(argName) ⇒ <code>string</code>
On live mode when new rows are coming and auto-scroll is on, scroll-down

**Kind**: global function  
**Returns**: <code>string</code> - blabla  

| Param | Type | Description |
| --- | --- | --- |
| argName | <code>string</code> | blabla |

<a name="_autoScrollOnReset"></a>

## _autoScrollOnReset()
Auto-scroll top on logs reference change
for example when we clean and add new rows, just scroll top

**Kind**: global function  
<a name="_autoScrollOnSelected"></a>

## _autoScrollOnSelected()
Auto-scroll to selected row:
A row is selected and it was not the case earlier,
so let's scroll to it if not in the screen!

**Kind**: global function  
<a name="_computeTablePosition"></a>

## _computeTablePosition()
Fake big scroll
Only dozen of rows are actually displayed in the table inside a big DIV scrolling
so we need to calculate the position of the table inside it
this is made for performance, DOM cannot handle 50k nodes

**Kind**: global function  
