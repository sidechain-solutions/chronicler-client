# Chronicler Client

Front End for interacting with the Chronicler Network. A Lisk SDK based decentralized Blockchain to store, audit, or verify various types of data. Proof of Concept, not for Production.

See https://chronicler.cc for a live demo or https://api.chronicler.cc for API access.

![Chronicler Front-End](https://github.com/sidechain-solutions/extras/blob/master/chron-sm.png)


## Submit Archive:

 - Form Fields: [title] [archival type] [file/text] [passphrase]
 - Convert Files to Base 91 for efficient storage
 - Broadcast prepared Text or Binary Transaction to Chronicler Blockchain

## View Archive:

 - Submit Address attached to an Archive for Searching
 - View Text Archive or File Archive results

## Custom Transactions:

### archiveTextTransaction

 - Type: 101
 - Format: Text
 - Description: Plain text and HTML markup
 - Size (CHAR): 20000
 - Fee: 10

### archiveBinaryTransaction
 - Type: 102
 - Format: Binary
 - Description: Images, Executables, PDF
 - Size (CHAR): 1000000
 - Fee: 1000
