import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  outlet = true
  public copy
  public forms: any = []
  public values: any = []
  public dependency: any = []
  constructor(
    private cdRef: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.initForm()
    this.getValue()
    console.log(this.values[0].value);

    this.sortDependency()
    console.log("Current value", this.values);
    console.log("JSON", this.forms);
    
    this.copy = JSON.parse(JSON.stringify(this.forms));
  }

  onChange(event, i) {
    try {
      this.checkDependency(i, event.changed.value)
      if (this.forms[i].components[0].type === "table") {
        this.forms[i].components[0].value = this.setTableValue(event, i)
      } else {
        this.forms[i].components[0].value = event.changed.value
      }
      this.cdRef.detectChanges();

    } catch (error) {

      return
    }
    this.reload(i)
    this.getValue()
  }

  //Checks if required fields has value
  verifyForm() {
    for (let i = 0; i < this.forms.length; i++) {
      if (this.forms[i].components[0].type !== 'htmlelement') {

        //        console.log("value at index: " + i, this.forms[i].components[0].value);

        if (this.forms[i].components[0].validate.hasOwnProperty("required")) {
          if (this.forms[i].components[0].validate.required === true &&
            !this.forms[i].components[0].value) {
            return true
          }
        } else if (!this.forms[i].components[0].value) {
          return true
        }
      }
    }
    return false
  }

  //Hackish solution to rerender fields onchange
  reload(index) {
    console.log("RELOADING");
    let temp = this.forms[index]
    setTimeout(() => this.forms.splice(index, 1, temp))

  }


  checkDependency(index, eventValue) {
    for (let i = 0; i < this.dependency.length; i++) {
      if (this.forms[index].components[0].key === this.dependency[i].dependentTo &&
        this.dependency[i].field.components[0].activateOn === eventValue) {

        console.log("add hidden")
        this.dependency[i].addedToForm = true
        this.forms[this.dependency[i].index].components[0].hidden = false

      } else if (this.forms[index].components[0].key === this.dependency[i].dependentTo &&
        this.dependency[i].addedToForm === true &&
        this.dependency[i].field.components[0].activateOn !== eventValue) {

        console.log("removed hidden")
        this.dependency[i].addedToForm = false
        this.forms[this.dependency[i].index].components[0].hidden = true

      }
    }

  }
  //Hides fields initially tagged as hidden and removes required
  isHidden(index) {

    if (this.forms[index].components[0].hidden === true) {
      this.forms[index].components[0].value = ""
      this.values[index].value = ""
      this.forms[index].components[0].validate.required = false
      return false
    } else {
      this.forms[index].components[0].validate.required = true
      return true
    }


  }
  //Adds to an array of dependency(used for checking) if field display is dependent to other field/s
  sortDependency() {

    for (let i = 0; i < this.forms.length; i++) {
      if (this.forms[i].components[0].hasOwnProperty("dependentTo")) {
        this.dependency.push({
          addedToForm: false,
          dependentTo: this.forms[i].components[0].dependentTo,
          index: i,
          field: this.forms[i]
        });
      }

    }

  }

  //Gets all the values of the input. Output is a JSON
  getValue() {
    console.log("called");

    this.values = []
    for (let i = 0; i < this.forms.length; i++) {
      if (this.forms[i].components[0].type !== 'htmlelement') {
        this.values.push({
          "key": this.forms[i].components[0].label,
          "id": this.forms[i].components[0].key,
          "value": this.forms[i].components[0].value
        });
      }


    }
    console.log(this.values);

  }
  submitForm() {
    //this.formService.submitForm(this.values)
  }


  isTable(index) {

    return this.forms[index].components[0].type === "table"
  }

  addRow(index) {
    console.log("table at index: " + index, this.forms[index].components[0].rows);
    console.log(this.forms[index].components[0].rows.length);
    this.forms[index].components[0].numRows += 1
    let count = this.forms[index].components[0].numRows - 1
    let tempJson = JSON.parse(JSON.stringify(this.copy[index].components[0].rows[1]));
    this.forms[index].components[0].rows.push(tempJson)
    this.forms[index].components[0].rows[count][0].components[0].content = count.toString()
    setTimeout(() => this.outlet = false);
    setTimeout(() => this.outlet = true);
    this.reload(index)

  }

  setTableValue(event, index) {
    this.forms[index].components[0].rows[event.changed.instance.tableRow][event.changed.instance.tableColumn].components[0].value = event.changed.value
    this.forms[index].components[0].rows[event.changed.instance.tableRow][event.changed.instance.tableColumn].components[0].defaultValue = event.changed.value

    console.log("table values");

    let tableRow = this.forms[index].components[0].rows.length
    let tableValue = []
    for (let i = 1; i < tableRow; i++) {
      let tempValue = []

      for (let j = 1; j < this.forms[index].components[0].rows[i].length; j++) {
        //  console.log(this.forms[index].components[0].rows[i][j]);
        tempValue.push({
          key: this.forms[index].components[0].rows[i][j].components[0].key,
          id: this.forms[index].components[0].rows[i][j].components[0].label,
          value: this.forms[index].components[0].rows[i][j].components[0].value
        })
        console.log("Row:" + i, "Column:" + j + " :" + this.forms[index].components[0].rows[i][j].components[0].value);

      }
      tableValue.push({
        key: "row_" + i,
        id: "row_" + i,
        value: tempValue

      }

      );
    }
    console.log("table values", tableValue);
    return tableValue

  }

  initForm() {
    this.forms = [

      {
        components: [
          {
            "label": "Account Identifier Details",
            "tag": "h1",
            "content": "Account Identifier Details",
            "attrs": [
              {
                "attr": "",
                "value": ""
              }
            ],
            "refreshOnChange": false,
            "tableView": false,
            "key": "accountIdentifierDetails",
            "type": "htmlelement",
            "input": false,
            "tooltip":"Yes",
            "validate": {
              "unique": false,
              "multiple": false
            }

          }
        ]
      },
      {
        "components": [
          {
            "label": "Select",
            "widget": "html5",
            "appearance":"outline",
            "hideLabel": true,
            "id": "sex",
            "placeholder": "Sex",
            "tableView": true,
            "data": {
              "values": [
                {
                  "label": "Male.",
                  "value": "male"
                },
                {
                  "label": "Female.",
                  "value": "female"
                }
              ]
            },
            "selectThreshold": 0.3,
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "field",
            "type": "select",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Weight",
            "mask": false,
            "appearance":"outline",
            "spellcheck": true,
            "tableView": false,
            "delimiter": false,
            placeholder: "Weight (kg)",
            hideLabel: true,
            "requireDecimal": false,
            "inputFormat": "plain",
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "age",
            "type": "number",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Height",
            "mask": false,
            "spellcheck": true,
            "appearance":"outline",
            "tableView": false,
            "delimiter": false,
            placeholder: "Height (cm)",
            hideLabel: true,
            "requireDecimal": false,
            "inputFormat": "plain",
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "age",
            "type": "number",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Blood Pressure",
            "spellcheck": true,
            "appearance":"outline",
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "History of heart attack",
            "appearance":"outline",
            "inline": true,
            "widget": "choicesjs",
            "tableView": true,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              },
              {
                "label": "I don't know",
                "value": "idontknow",
                "shortcut": ""
              }
            ],
            "selectThreshold": 0.3,
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "historyOfHeartAttack",
            "type": "radio",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "History of heart attack/ stroke in first degree relative",
            "widget": "choicesjs",
            "appearance":"outline",
            "inline": true,
            "tableView": true,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              },
              {
                "label": "I don't know",
                "value": "idontknow",
                "shortcut": ""
              }
            ],
            "selectThreshold": 0.3,
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "historyOfHeartAttack",
            "type": "radio",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Hypertension",
            "optionsLabelPosition": "right",
            "appearance":"outline",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              },
              {
                "label": "I don't know",
                "value": "idontknow",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "hypertension",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "If yes, taking medications?",
            "appearance":"outline",
            "optionsLabelPosition": "right",
            "hidden": true,
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "ifyestakingmedication",
            "dependentTo": "hypertension",
            "activateOn": "yes",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Diabetes mellitus",
            "appearance":"outline",
            "inline": true,
            "widget": "choicesjs",
            "tableView": true,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              },
              {
                "label": "I don't know",
                "value": "idontknow",
                "shortcut": ""
              }
            ],
            "selectThreshold": 0.3,
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "Diabetes mellitus",
            "type": "radio",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      },

      {
        "components": [
          {
            "label": "If yes, taking medications?",
            "appearance":"outline",
            "optionsLabelPosition": "right",
            "inline": true,
            "hidden": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "ifyestakingmedication",
            "dependentTo": "Diabetes mellitus",
            "activateOn": "yes",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "High Cholesterol",
            "inline": true,
            "hidden": true,
            "dependentTo": "Diabetes mellitus",
            "appearance":"outline",
            "activateOn": "yes",
            "widget": "choicesjs",
            "tableView": true,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              },
              {
                "label": "I don't know",
                "value": "idontknow",
                "shortcut": ""
              }
            ],
            "selectThreshold": 0.3,
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "historyOfHeartAttack",
            "type": "radio",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "If yes, taking medications?",
            "appearance":"outline",
            "optionsLabelPosition": "right",
            "hidden": true,
            "dependentTo": "Diabetes mellitus",
            "activateOn": "yes",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "ifyestakingmedication",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Blood Pressure (with the use of digital device)",
            "appearance":"outline",
            "tooltip": "First recording",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Blood Pressure (with the use of digital device)",
            "appearance":"outline",
            "tooltip": "Second recording",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Current Smoker",
            "appearance":"outline",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "currentsmoker",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "If yes, how many years smoking",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "no",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "ifyes, how many years smoking",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Previous smoker but subsequently discontinued",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Less than 1 year",
                "value": "Less than 1 year",
                "shortcut": ""
              },
              {
                "label": "1 - 5 years",
                "value": "1 - 5 years",
                "shortcut": ""
              }
              ,
              {
                "label": "More than 5 years",
                "value": "More than 5 years",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "previoussmoker",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Intake of > 1 standard alchoholic drink per day",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Less than 1 year",
                "value": "Less than 1 year",
                "shortcut": ""
              },
              {
                "label": "1 - 5 years",
                "value": "1 - 5 years",
                "shortcut": ""
              }
              ,
              {
                "label": "More than 5 years",
                "value": "More than 5 years",
                "shortcut": ""
              }
            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "intakeof",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Physical Exercise?",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "Yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "No",
                "shortcut": ""
              }

            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "physicalexercise",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "How often is physical exercise done?",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "<3x a week",
                "value": "<3x a week",
                "shortcut": ""
              },
              {
                "label": "≥3x a week",
                "value": "≥3x a week",
                "shortcut": ""
              }

            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "often",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Intake of well-balanced diet (vegetables, fruits, meat, fish)?",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "Yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "No",
                "shortcut": ""
              }

            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "intake",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Do you sleep >6 hours per day?",
            "optionsLabelPosition": "right",
            "inline": true,
            "tableView": false,
            "values": [
              {
                "label": "Yes",
                "value": "Yes",
                "shortcut": ""
              },
              {
                "label": "No",
                "value": "No",
                "shortcut": ""
              }

            ],
            "validate": {
              "unique": false,
              "multiple": false
            },
            "key": "sleep",
            "type": "radio",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "HbA1c",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "FBS",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "Total cholesterol",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      },
      {
        "components": [
          {
            "label": "LDL",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      }
      ,
      {
        "components": [
          {
            "label": "HDL",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      }
      ,
      {
        "components": [
          {
            "label": "Microalbuminuria",
            "spellcheck": true,
            "tableView": true,
            "validate": {
              "pattern": "^\\d{1,3}\\/\\d{1,3}$",
              "unique": false,
              "multiple": false
            },
            "key": "bloodPressureWithTheUseOfDigitalDevice",
            "type": "textfield",
            "input": true
          }
        ]
      }
    ]
  }




}
