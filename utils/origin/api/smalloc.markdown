# Smalloc

    Stability: 1 - Experimental

## smalloc.alloc(length[, receiver][, type])

* `length` {Number} `<= smalloc.kMaxLength`
* `receiver` {Object}, Optional, Default: `new Object`
* `type` {Enum}, Optional, Default: `Uint8`

Returns `receiver` with allocated external array data. If no `receiver` is
passed then a new Object will be created and returned.

Buffers are backed by a simple allocator that only handles the assignation of
external raw memory. Smalloc exposes that functionality.

This can be used to create your own Buffer-like classes. No other properties are
set, so the user will need to keep track of other necessary information (e.g.
`length` of the allocation).

    function SimpleData(n) {
      this.length = n;
      smalloc.alloc(this.length, this);
    }

    SimpleData.prototype = { /* ... */ };

It only checks if the `receiver` is an Object, and also not an Array. Because of
this it is possible to allocate external array data to more than a plain Object.

    function allocMe() { }
    smalloc.alloc(3, allocMe);

    // { [Function allocMe] '0': 0, '1': 0, '2': 0 }

v8 does not support allocating external array data to an Array, and if passed
will throw.

It's possible is to specify the type of external array data you would like. All
possible options are listed in `smalloc.Types`. Example usage:

    var doubleArr = smalloc.alloc(3, smalloc.Types.Double);

    for (var i = 0; i < 3; i++)
      doubleArr = i / 10;

    // { '0': 0, '1': 0.1, '2': 0.2 }

## smalloc.copyOnto(source, sourceStart, dest, destStart, copyLength);

* `source` Object with external array allocation
* `sourceStart` Position to begin copying from
* `dest` Object with external array allocation
* `destStart` Position to begin copying onto
* `copyLength` Length of copy

Copy memory from one external array allocation to another. No arguments are
optional, and any violation will throw.

    var a = smalloc.alloc(4);
    var b = smalloc.alloc(4);

    for (var i = 0; i < 4; i++) {
      a[i] = i;
      b[i] = i * 2;
    }

    // { '0': 0, '1': 1, '2': 2, '3': 3 }
    // { '0': 0, '1': 2, '2': 4, '3': 6 }

    smalloc.copyOnto(b, 2, a, 0, 2);

    // { '0': 4, '1': 6, '2': 2, '3': 3 }

`copyOnto` automatically detects the length of the allocation internally, so no
need to set any additional properties for this to work.

## smalloc.dispose(obj)

* `obj` Object

Free memory that has been allocated to an object via `smalloc.alloc`.

    var a = {};
    smalloc.alloc(3, a);

    // { '0': 0, '1': 0, '2': 0 }

    smalloc.dispose(a);

    // {}

This is useful to reduce strain on the garbage collector, but developers must be
careful. Cryptic errors may arise in applications that are difficult to trace.

    var a = smalloc.alloc(4);
    var b = smalloc.alloc(4);

    // perform this somewhere along the line
    smalloc.dispose(b);

    // now trying to copy some data out
    smalloc.copyOnto(b, 2, a, 0, 2);

    // now results in:
    // Error: source has no external array data

`dispose()` does not support Buffers, and will throw if passed.

## smalloc.kMaxLength

Size of maximum allocation. This is also applicable to Buffer creation.

## smalloc.Types

Enum of possible external array types. Contains:

* `Int8`
* `Uint8`
* `Int16`
* `Uint16`
* `Int32`
* `Uint32`
* `Float`
* `Double`
* `Uint8Clamped`
