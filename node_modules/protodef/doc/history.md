# History

## 1.6.0

* add full packet parser

## 1.5.1

* fix optional validation

## 1.5.0

* validation is now optional (opt-out)

## 1.4.0

* implement aliases

## 1.3.1

* fix countType : now behave as an ordinary type, remove undocumented countTypeArgs

## 1.3.0

* validate types against type schemas using the protodef validator

## 1.2.3

* fix sendCount : write return the offset, not the size, add a test for this

## 1.2.2

* stop swallowing errors in parser and serializer

## 1.2.1

* add li8, lu8 and u64, lu64 for consistency

## 1.2.0

* all datatypes are tested
* fix cstring
* fix PartialReadError in i64
* remove special count
* use protodef spec
* add little endian numerical types

## 1.1.2

* allow hex values in mappings

## 1.1.1

* update some more dependencies

## 1.1.0

* update to babel6, remove some dependencies

## 1.0.3

* fix slice the buffer in parsePacketBuffer

## 1.0.2

* slice the buffer in parsePacketBuffer

## 1.0.1

* let the parser error out without crashing on errors

## 1.0.0

* change the name of numerical types
* add doc


## 0.3.0

* add partial packet support

## 0.2.6

* add compareToValue (optional) option to switch

## 0.2.5

* fix small error in switch

## 0.2.4

* get back the example file as one file for simplicity and for tonic

## 0.2.3

* fix a small mistake in mapping error
* improve internal code
* improve example
* integrate with tonicdev

## 0.2.2

* Fix writeOption : the offset wasn't properly updated

## 0.2.1

* Anon fields may now be null/undefined.

## 0.2.0

* add createPacketBuffer and parsePacketBuffer to ProtoDef class
* expose utils functions
* add mapper and pstring datatypes

## 0.1.0

* add the serializer and parser
* expose the default datatypes
* add an example

## 0.0.1

* basic version, mostly contain the ProtoDef class and the datatype