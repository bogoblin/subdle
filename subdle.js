const subs = fetch("subs.tsv")
    .then(res => res.text())
    .then(text => text.split("\n").map(line => line.split("\t")))
    .then(subs => {
        const parsed_subs = {};
        const header = subs[0];
        for (const sub of subs.slice(1)) {
            const parsed_sub = {};
            for (let i=1; i<sub.length; ++i) {
                parsed_sub[header[i]] = sub[i];
            }
            const name = sub[0].replaceAll(/\s+$/g, "");
            parsed_sub["name"] = name;
            parsed_subs[name] = parsed_sub;
        }
        return parsed_subs;
    })
    .then(subs => game(subs));

function game(subs) {
    console.log(subs);
    const tableElement = document.getElementById("guess-table");
    const formElement = document.getElementById("game-form");
    const options = document.getElementById("options");
    for (const sub in subs) {
        const option = document.createElement("option");
        option.innerText = sub;
        options.appendChild(option);
    }

    const order = [4, 7, 9, 2, 0, 6, 7, 10, 3, 5, 11];
    const index = (new Date().getDate() + new Date().getMonth()) % order.length;
    const subsArray = Object.values(subs);
    const todaysSub = subsArray[index%subsArray.length];
    let guesses = 0;
    let chosenOption = document.getElementById("option");
    formElement.onsubmit = (event) => {
        event.preventDefault();
        guesses += 1;
        const chosen = chosenOption.value;
        const chosenSub = subs[chosen];
        if (!chosenSub) {
            return 1;
        }
        const row = guessRow(subs, subs[chosen], todaysSub);
        tableElement.appendChild(row);
        if (subs[chosen] === todaysSub) {
            const winbox = document.getElementById("you-win");
            winbox.innerHTML = `
            <h1>You Win!</h1>
            <h2>It was ${todaysSub.name}!</h2>
            <h3>You got it in ${guesses} guesses!</h3>
            <p>Made by <a href="github.com/bogoblin">bogoblin</a> 2024</p>
            `;
            winbox.setAttribute("open", "true");
        }
        return 1;
    }
}

function guessRow(subs, guess, correctSub) {
    const row = document.createElement("tr");
    const correct = guess === correctSub;
    if (correct) {
        row.className = "correct";
    }
    row.appendChild(guessCell(guess, correctSub, "name", 0, ""));
    row.appendChild(guessCell(guess, correctSub, "Price footlong", 2, "$"));
    row.appendChild(guessCell(guess, correctSub, "Calories", 100, "", " calories"));
    row.appendChild(guessCell(guess, correctSub, "Sodium (mg)", 500, "", "mg"));
    row.appendChild(guessCell(guess, correctSub, "Protein(g)", 10, "", "g"));
    row.appendChild(guessCell(guess, correctSub, "Carb. (g)", 10, "", "g"));
    row.appendChild(guessCell(guess, correctSub, "Total Fat (g)", 5, "", "g"));

    return row;
}

function guessCell(guess, correctSub, key, nearlyThreshold, prefix = "", suffix = "") {
    const cell = document.createElement("th");
    if (key === "name") {
        if (correctSub === guess) {
            cell.className += " correct"
        } else {
        }
    } else {
        const difference = correctSub[key] - guess[key];
        if (difference > 0) {
            cell.className += " higher";
        } else if (difference < 0) {
            cell.className += " lower";
        } else {
            cell.className += " correct";
        }
        if (Math.abs(difference) < nearlyThreshold) {
            cell.className += " nearly";
        }
    }
    cell.innerText = prefix + guess[key] + suffix;
    return cell;
}