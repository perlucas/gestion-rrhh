
/**
 * appends an alert to the element passed in
 * 
 * @param {Object} options - must have following properties
 * {
 *  element: {String} jQuery Id of the parent element
 *  type: {String} - success|danger|warning|info|light|dark
 *  message: {String} - message to show on screen
 *  fixed: {Boolean} - true if the alert can't be removed
 *  timeout: {Integer} - (used only if not fixed) Optionally. Number 
 *      of milisecs the alert is being showed. Show the alert until it's 
 *      closed if no timeout is sent.
 * }
 */
function appendAlert(options) {
    var parent = $(options.element);
    if ( !parent ) throw "Bad options param: missing element property";


    if (options.fixed) {
        var template = `<div class="alert alert-${options.type}" role="alert">${options.message}</div>`;
    } 
    else {
        var template = `<div class="alert alert-${options.type} alert-dismissible fade show" role="alert">${options.message}<button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;

    }
    
    var element = $(template);
    parent.append(element);

    if (! options.fixed && options.timeout ) {

        setTimeout(function () {
            element.fadeOut(4000, function () {
                element.alert('close');
            });
        }, options.timeout);

    }

}

/**
 * generates a unique string tobe used as an input id
 * 
 * @returns {String}
 */
function generateUniqueId() {
    var dd = (new Date()).getTime().toString(36) + Math.floor(Math.random() * 100);
    return 'A' + dd;
}

/**
 * 
 * @param {object} target 
 * @param {object} source 
 * @param {Array} props 
 * @returns {object}
 */
function assignProps(target, source, props)
{
    props.forEach(v => {
        target[v] = source[v];
    });
    return target;
}

/*************************************************************/
/*************************************************************/
/**************** Vuejs component: datepicker ****************/
/*************************************************************/
/*************************************************************/

Vue.component('my-datepicker', {
    template: `
    <div v-bind:class="parentcss">
        <label v-bind:for="inputId" :class="labelcss">
            {{ title }}
        </label>
        <input v-show="editable" class="form-control py-4" v-bind:id="inputId" v-bind:name="inputname" v-bind:value="value">
        <div v-if="editable" class='w-100'></div>
        <span v-else>{{ value }}</span>
    </div>`,

    props: {
        parentcss: {
            type: String,
            required: true
        },

        labelcss: {
            type: String,
            default: 'small mb-1'
        },
        
        title: {
            type: String,
            required: true
        },

        inputname: {
            type: String,
            default: generateUniqueId()
        },

        value: {
            type: String,
            required: true
        },

        editable: {
            type: Boolean,
            default: true
        }
    },

    data: function () {
        return {
            inputId: generateUniqueId()
        };
    },

    mounted() {
        if (this.editable) {
            this.mountPicker();
        }
    },

    methods: {
        mountPicker: function () {
            // init jQuery datepicker
            const obj = this;console.log("mounted datepicker");

            $(`#${this.inputId}`).datepicker({
                uiLibrary: 'bootstrap4',
                format: 'dd/mm/yyyy',
                value: this.value,
                change: function () {
                    obj.$emit('input', $(`#${obj.inputId}`).datepicker().value() );
                }
            });
        },

        dismountPicker: function () {
            $(`#${this.inputId}`).datepicker().destroy();
        },

        changeTo: function (newVal) {
            $(`#${this.inputId}`).datepicker().value(newVal);
        }
    },

    watch: {
        editable: function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue) {
                    this.mountPicker();
                } else {
                    this.dismountPicker();
                }
            }
        }
    }
});

/*************************************************************/
/*************************************************************/
/********* Vuejs component: datepicker (alternative) *********/
/*************************************************************/
/*************************************************************/

Vue.component('my-datepicker-alternative', {

    template: `
    <div :class="parentCss">
        <label :for="inputId" class="col-4 col-form-label font-weight-bold">{{ title }}</label>
        <div v-show='editMode' class="col-8">
            <input class="form-control" :id="inputId" :name="inputName" :value="value">
        </div>
        <div class="col-8" v-if="! editMode">
            <span>{{ value }}</span>
        </div>
    </div>`,

    data: function () {
        return {
            inputId: generateUniqueId()
        }
    },

    props: {
        title: {
            type: String,
            required: true
        },

        parentCss: {
            type: String,
            default: 'form-group row'
        },

        inputName: {
            type: String,
            default: ''
        },

        editMode: {
            type: Boolean,
            default: true
        },

        value: {
            type: String,
            required: true
        }
    },

    mounted() {
        // init jQuery datepicker
        const obj = this;

        $(`#${this.inputId}`).datepicker({
            uiLibrary: 'bootstrap4',
            format: 'dd/mm/yyyy',
            value: this.value,
            change: function () {
                obj.$emit('input', $(`#${obj.inputId}`).datepicker().value() );
            }
        });
    }
});



/*************************************************************/
/*************************************************************/
/**************** Vuejs component: skillset ****************/
/*************************************************************/
/*************************************************************/

Vue.component('my-skillset', {
    
    template: `<div :class="parentcss">
        <label :for="inputId" :class="'col-4 col-form-label ' + labelcss">
            {{ title }}
        </label>

        <div class="col-8">

            <div class='input-group' v-if="editable">
                <input class="form-control" :id="inputId" v-on:keyup.enter.stop.prevent="addNewSkill()" v-model='newSkill' placeholder="Agregar nueva">

                <div class="input-group-append">
                    <button class="btn btn-primary" type="button" id="button-addon2" v-on:click.stop.prevent="addNewSkill()">
                        Añadir
                    </button>
                </div>
            </div>

            <div class="w-100" v-if="editable"></div>

            <ul class="list-inline">
                <li v-for="skill in skills" class="list-inline-item bg-info mt-2 p-2 text-white rounded-pill">
                    {{ skill }}
                    <a @click="removeSkill(skill)" v-if="editable">
                        <i class="fas fa-times-circle"></i>
                    </a>
                </li>
            </ul>
            
        </div>
    </div>`,

    data: function () {
        return {
            inputId: generateUniqueId(),
            newSkill: ''
        };
    },

    props: {
        title: {
            type: String,
            required: true
        },

        skills: {
            type: Array,
            default: function () { return []; }
        },

        skillset: {
            type: [String, Array],
            default: function () { return []; }
        },

        parentcss: {
            type: String,
            required: true
        },

        labelcss: {
            type: String,
            default: ''
        },

        editable: {
            type: Boolean,
            default: true
        }
    },

    methods: {

        addNewSkill: function () {
            if (this.newSkill) {
                this.skills.push(this.newSkill);
                this.$emit('new-skill', this.newSkill);
                this.$emit('skills-changed', this.skills);
                this.newSkill = '';
            }
        },

        removeSkill: function (skk) {
            this.skills = this.skills.filter( v => v !== skk);
            this.$emit('remove-skill', skk);
            this.$emit('skills-changed', this.skills);
        },

        removeAll: function () {
            var allSkills = this.skills;
            allSkills.forEach(v => this.removeSkill(v));
        }

    },

    mounted() {
        if (this.skillset) {

            if (! Array.isArray(this.skillset) && typeof this.skillset !== 'string')
                throw "skillset prop must be an array or a string";

            var addThese = Array.isArray(this.skillset)
                ? this.skillset
                : this.skillset.split(',');
            
            addThese.forEach(v => {
                this.newSkill = v;
                this.addNewSkill();
            });
        }
    }

});