var Changeset = require('./utils/Changeset');

  function print(str) {
    console.log(str);
  }

  function assert(code, optMsg) {
    if (!eval(code)) throw new Error("FALSE: " + (optMsg || code));
  }

  function literal(v) {
    if ((typeof v) == "string") {
      return '"' + v.replace(/[\\\"]/g, '\\$1').replace(/\n/g, '\\n') + '"';
    } else
    return JSON.stringify(v);
  }

  function assertEqualArrays(a, b) {
    assert("JSON.stringify(" + literal(a) + ") == JSON.stringify(" + literal(b) + ")");
  }

  function assertEqualStrings(a, b) {
    assert(literal(a) + " == " + literal(b));
  }


function applyMutations(mu, arrayOfArrays) {
    arrayOfArrays.forEach(function (a) {
	var result = mu[a[0]].apply(mu, a.slice(1));
	if (a[0] == 'remove' && a[3]) {
            assertEqualStrings(a[3], result);
	}
    });
}

  function mutationsToChangeset(oldLen, arrayOfArrays) {
    var assem = Changeset.smartOpAssembler();
    var op = Changeset.newOp();
    var bank = Changeset.stringAssembler();
    var oldPos = 0;
    var newLen = 0;
    arrayOfArrays.forEach(function (a) {
      if (a[0] == 'skip') {
        op.opcode = '=';
        op.chars = a[1];
        op.lines = (a[2] || 0);
        assem.append(op);
        oldPos += op.chars;
        newLen += op.chars;
      } else if (a[0] == 'remove') {
        op.opcode = '-';
        op.chars = a[1];
        op.lines = (a[2] || 0);
        assem.append(op);
        oldPos += op.chars;
      } else if (a[0] == 'insert') {
        op.opcode = '+';
        bank.append(a[1]);
        op.chars = a[1].length;
        op.lines = (a[2] || 0);
        assem.append(op);
        newLen += op.chars;
      }
    });
    newLen += oldLen - oldPos;
    assem.endDocument();
    return Changeset.pack(oldLen, newLen, assem.toString(), bank.toString());
  }

function runMutationTest(testId, origLines, muts, correct) {
    var lines = origLines.slice();
    var mu = Changeset.textLinesMutator(lines);
    applyMutations(mu, muts);
    mu.close();
    assertEqualArrays(correct, lines);
    
    var inText = origLines.join('');
    var cs = mutationsToChangeset(inText.length, muts);
    lines = origLines.slice();
    Changeset.mutateTextLines(cs, lines);
    assertEqualArrays(correct, lines);
    
    var correctText = correct.join('');
    //print(literal(cs));
    var outText = Changeset.applyToText(cs, inText);
    assertEqualStrings(correctText, outText);
  }


  runMutationTest(1, ["apple\n", "banana\n", "cabbage\n", "duffle\n", "eggplant\n"], [
    ['remove', 1, 0, "a"],
    ['insert', "tu"],
    ['remove', 1, 0, "p"],
    ['skip', 4, 1],
    ['skip', 7, 1],
    ['insert', "cream\npie\n", 2],
    ['skip', 2],
    ['insert', "bot"],
    ['insert', "\n", 1],
    ['insert', "bu"],
    ['skip', 3],
    ['remove', 3, 1, "ge\n"],
    ['remove', 6, 0, "duffle"]
  ], ["tuple\n", "banana\n", "cream\n", "pie\n", "cabot\n", "bubba\n", "eggplant\n"]);
