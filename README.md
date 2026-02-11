# distribution

This is the distribution library. 

## Environment Setup

We recommend using the prepared [container image](https://github.com/brown-cs1380/container).

## Installation

After you have setup your environment, you can start using the distribution library.
When loaded, distribution introduces functionality supporting the distributed execution of programs. To download it:

```sh
$ npm i '@brown-ds/distribution'
```

This command downloads and installs the distribution library.

## Testing

There are several categories of tests:
  *	Regular Tests (`*.test.js`)
  *	Scenario Tests (`*.scenario.js`)
  *	Extra Credit Tests (`*.extra.test.js`)
  * Student Tests (`*.student.test.js`) - inside `test/test-student`

### Running Tests

By default, all regular tests are run. Use the options below to run different sets of tests:

1. Run all regular tests (default): `$ npm test` or `$ npm test -- -t`
2. Run scenario tests: `$ npm test -- -c` 
3. Run extra credit tests: `$ npm test -- -ec`
4. Run the `non-distribution` tests: `$ npm test -- -nd`
5. Combine options: `$ npm test -- -c -ec -nd -t`

## Usage

To try out the distribution library inside an interactive Node.js session, run:

```sh
$ node
```

Then, load the distribution library:

```js
> let distribution = require("@brown-ds/distribution")();
> distribution.node.start(console.log);
```

Now you have access to the full distribution library. You can start off by serializing some values. 

```js
> s = distribution.util.serialize(1); // '{"type":"number","value":"1"}'
> n = distribution.util.deserialize(s); // 1
```

You can inspect information about the current node (for example its `sid`) by running:

```js
> distribution.local.status.get('sid', console.log); // null 8cf1b (null here is the error value; meaning there is no error)
```

You can also store and retrieve values from the local memory:

```js
> distribution.local.mem.put({name: 'nikos'}, 'key', console.log); // null {name: 'nikos'} (again, null is the error value) 
> distribution.local.mem.get('key', console.log); // null {name: 'nikos'}

> distribution.local.mem.get('wrong-key', console.log); // Error('Key not found') undefined
```

You can also spawn a new node:

```js
> node = { ip: '127.0.0.1', port: 8080 };
> distribution.local.status.spawn(node, console.log);
```

Using the `distribution.all` set of services will allow you to act 
on the full set of nodes created as if they were a single one.

```js
> distribution.all.status.get('sid', console.log); // {} { '8cf1b': '8cf1b', '8cf1c': '8cf1c' } (now, errors are per-node and form an object)
```

You can also send messages to other nodes:

```js
> distribution.local.comm.send(['sid'], {node: node, service: 'status', method: 'get'}, console.log); // null 8cf1c
```

Most methods in the distribution library are asynchronous and take a callback as their last argument.
This callback is called when the method completes, with the first argument being an error (if any) and the second argument being the result.
If you wanted to run this same sequence of commands in a script, you could do something like this (note the nested callbacks):

```js
let distribution = require("@brown-ds/distribution")();
// Now we're only doing a few of the things we did above
const out = (cb) => {
  distribution.local.status.stop(cb); // Shut down the local node
};
distribution.node.start(() => {
  // This will run only after the node has started
  const node = {ip: '127.0.0.1', port: 8765};
  distribution.local.status.spawn(node, (e, v) => {
    if (e) {
      return out(console.log);
    }
    // This will run only after the new node has been spawned
    distribution.all.status.get('sid', (e, v) => {
      // This will run only after we communicated with all nodes and got their sids
      console.log(v); // { '8cf1b': '8cf1b', '8cf1c': '8cf1c' }
      // Shut down the remote node
      distribution.local.comm.send([], {service: 'status', method: 'stop', node: node}, () => {
        // Finally, stop the local node
        out(console.log); // null, {ip: '127.0.0.1', port: 1380}
      });
    });
  });
});
```

# Results and Reflections

# M0: Setup & Centralized Computing
* name: `Eric Xia`

* email: `eric_xia@brown.edu`

* cslogin: `exia3`

## Summary

> Summarize your implementation, including the most challenging aspects; remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete M0 (`hours`), the total number of JavaScript lines you added, including tests (`jsloc`), the total number of shell lines you added, including for deployment and testing (`sloc`).

My implementation consists of `7` components addressing T1--8. The most challenging aspect was implementing the additional tests. During the implementation, a slew of minor issues made many outputs to the console and error stream uninformative. The ultimate issues included distinguishing tabs and spaces within whitespace, relative and absolute file paths, and escaping quotes within shell commands. Within query.js, I also encountered a similar issue with interpreting the args parameter correctly. The solution employs a regex to escape single quotes, and subsequently wraps arguments within their own set of quotes.

## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation.

To characterize correctness, I developed `9` tests which cover the following cases: 
- s_getURLs.sh: extract links from alternative data source (personal website)
- s_getText.sh: extract text from alternative data source (project description page)
- s_test_process.sh: extract links from alternative content from html (personal website)
- s_test_stem.sh: stems a list of common English words (rule-based, not morphologically sound)
- s_test_combine.sh: tests bigram and trigram generation from a fixed set of words
- s_test_invert.sh: tests inversion on a list generated from project page
- s_test_merge.sh: tests merge combination of indices
- s_test_end_to_end.sh: tests merge combination of local and global index

*Performance*: The throughput of various subsystems is described in the `"throughput"` portion of package.json. To characterize the throughput, a timed version of engine.sh was run on two diverse benchmarks: sandbox-2, a small collection of books with ~5 urls, and sandbox-4, a large web of quotes with ~200 urls. The average crawl, index, and query throughput was estimated by first dividing the total time for the crawl and index operations by the number of urls visited for each sandbox, and then averaging across both sandboxes.

```
Sandbox 2 - Dev (M1)
crawl time: 4
index time: 34
crawl urls: 4
query time: 3s, 5 queries

Sandbox 4 - Dev (M1)
crawl time: 85
index time: 72
crawl urls: 228
query time: 3s, 5 queries

Sandbox 2 - AWS t3.micro
crawl time: 9
index time: 11
crawl urls: 4
query time: 2 seconds, 5 queries

Sandbox 4 - AWS t3.micro
crawl time: 257
index time: 164
crawl urls: 228
query time: 2 seconds, 5 queries
```

The characteristics of my development machines are summarized in the `"dev"` and `"aws"` of package.json. For the development, a M2 Macbook Air (16 GB RAM) was used. For deployment on the cloud, a t3.micro instance was used.

## Wild Guess

> How many lines of code do you think it will take to build the fully distributed, scalable version of your search engine? Add that number to the `"dloc"` portion of package.json, and justify your answer below.

I am guessing it will take 2000 lines of code to write a distributed version of the search engine, and make the current implementation scalable. I anticipate writing a small amount of code to optimize parallel operations among the current components, a larger amount of code around the current components to allow them to be called in unison, and a similarly large amount of code to communicate status to one another.

# M1: Serialization / Deserialization


## Summary

My implementation consists of a serialization and a deserialization funcion, and totals `150` lines of code. The basic implementation strategy is to break each type into a separate serialization and deserialization strategy, which often uses an internal string representation method.

One major challenge faced was handling function object deserialization. The `toString` method simply describes the surface syntax, and requires careful handling to extract the function arguments and body. The function constructor was helpful for instantiating the reassembled function, yet understanding the correct pattern on the input was complicated. The intended implementation may have utilized a different serialization pattern. 

Another major challenge involved serializing array objects. The reference implementation utilized an ordered dict as the value of the serialized object. In order to reestablish individual elements of the array, `Array.from` was employed. In combination with a recursive call on `serializedDict`, this allowed the deserialization of individual elements in order.

For subtypes of Object such as Error, I utilized the builtin method `getOwnPropertyNames` to stringify each property. The subsequent deserialization utilized `Object.assign` to reestablish the method fields.

The fallback serialization and deserialization assumes the input is an object.

## Correctness & Performance Characterization

*Correctness*: I wrote `5` tests, which took between 0.1 to 10 milliseconds to execute within my development environment, and between 2-10 times as long on the EC2 instance. This included tests for simple strings, functions, nested objects, and the date / error subclasses. Different function types were tested to ensure the function serialization worked as intended.

*Performance*: The latency of various subsystems is described in the `"latency"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.

# M2: Actors and Remote Procedure Calls (RPC)

## Summary

The implementation of the distribution.js module was done in three parts. On average, the lines of code written matched the expected lines on the milestone document, with the exception of `routes` which took 20-30 lines more. The most difficult tests to debug had to do with the `node.js` http request and `comm.send`, as it was necessary to track data in multiple places.

The first part involved writing control logic for `status.get`. These retrieved properties for the current node from `distribution.node.config`, and were for the most part straightforward. The second part involved implementing a map for the routes on a node to service objects. The put and rem methods were made much simpler by settling on a single data structure to handle the routes within `get`.  In the third and final part, I implemented `comm.send`, which sent message contents within an PUT http request. 


My implementation comprises 3 software components, totaling 150 lines of code. 

Initializing counts within `node.js` was somewhat confusing, as I misunderstood how module imports work.

Within the body of `routes.get`, there were several edge cases involving missing defaults. In addition, implementing the `routes` call within `routes.get` was confusing due to the circular dependency.

I struggled with understanding where the callback function for send should be called. Ultimately, the logical place was to have it called with the deserialized response, thus reflecting the remote node function execution correctlyu.


## Correctness & Performance Characterization


To characterize correctness of the module, both provided and student tests were run. I wrote 5 tests, one for each of `status.get`, `routes.get`, `routes.put`, `routes.rem`, and `comm.send`. Each test examined unique functionality of the associated component. Altogether, the tests take 1 second to execute.

*Performance*: I characterized the performance of the comm functionality by sending 1000 service requests in a tight loop, averaged over five separate runs. This was performed for both the development machine and the remote machine. Average throughput is recorded in `package.json`.


## Key Feature

> How would you explain the implementation of `createRPC` to someone who has no background in computer science — i.e., with the minimum jargon possible?