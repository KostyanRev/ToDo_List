class Task {
    constructor(text){
        this.text = text
        this.isDone = false
    }
}

let dataService = {
    tasks: [],

    get allTasks(){
        return this.tasks;
    },
    get notCompletedTasks() {
        return this.tasks.filter(task => task.isDone == false)
    },

    add(task){
        this.tasks.push(task)
        this.save()
    },
    save(){
        localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },
    open(){
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || []
        footerDisplay()
    },
    removeAllTasks(){
        this.tasks.length = 0
    }
}

class TaskListViev {
    element
    constructor(element) {
        this.element = element
    }

    #drawList(tasksElements){
        this.element.innerHTML = ''

        tasksElements.forEach(tasksElement => {
            tasksElement.createIn(this.element)
        })
    }
    drawAll(){
        let taskElements = []
        let tasks = dataService.allTasks
        if(tasks.length == 0) return

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        })
        this.#drawList(taskElements)
    }
    drawNotCompleted(){
        let taskElements = []
        let tasks = dataService.notCompletedTasks
        if (tasks.length == 0) return;

        tasks.forEach(task => {
            taskElements.push(new TaskView(task))
        });
        this.#drawList(taskElements);
    }
}

class TaskView {
    constructor(task){
        this.task = task
        this.divMain = null
        this.divBody = null
    }

    createIn(element){
        this.divMain = document.createElement('div')
        this.divMain.classList.add('task-list__task', 'task', 'draggable')

        this.divBody = document.createElement('div')
        this.divBody.classList.add('task__body')

        let input = document.createElement('input')
        input.classList.add('task__checkbox')
        input.addEventListener('click', this.changeState.bind(this))
        input.type = 'checkbox'

        let p = document.createElement('p')
        p.innerText = this.task.text
        p.classList.add('task__text')

        let editInput = document.createElement('input')
        editInput.classList.add('task__edit')
        editInput.type = 'text'
        if(screen.width <= 420){
            editInput.size = 12
        }

        let deleteTaskBtn = document.createElement('button')
        deleteTaskBtn.innerText = 'Delete'
        deleteTaskBtn.classList.add('task__remove-btn', 'buttons')

        let editTaskBtn = document.createElement('button')
        editTaskBtn.innerText = 'Edit'
        editTaskBtn.classList.add('task__edit-btn','buttons')

        this.divMain.append(this.divBody)
        this.divMain.append(editTaskBtn)
        this.divMain.append(deleteTaskBtn)
        this.divBody.append(input)
        this.divBody.append(p)
        this.divBody.append(editInput)

        let attr = document.createAttribute('draggable')
        attr.value = 'true'
        this.divMain.setAttributeNode(attr)

        deleteTaskBtn.addEventListener('click', (e) => {
            element.removeChild(this.divMain)
            dataService.tasks.splice(dataService.tasks.indexOf(this.task) , 1)
            dataService.save()
            footerDisplay()
        })

        editTaskBtn.addEventListener('click', editTask)

        if(this.task.isDone){
            this.divBody.querySelector('p').classList.add('completed')
            input.checked = true
        }
        element.append(this.divMain)

        let listItems = document.querySelectorAll('.draggable')
        listItems.forEach(item => addEventsDragAndDrop(item))

    }
    changeState(){
        this.task.isDone = !this.task.isDone
        dataService.save()
        let paragraph = this.divBody.querySelector('p')
        paragraph.classList.toggle('completed')
    }
}

let taskNameInput = document.querySelector('#task-name-input')
let addTaskButton = document.querySelector('#add-task-btn')
let taskList = document.querySelector('.task-list__body')
let deleteAllButton = document.querySelector('#deleteBtn')
let showAllButton = document.querySelector('#showAllBtn')
let showNotCompletedButton = document.querySelector('#showIncompletedBtn')
let footer = document.querySelector('.footer')

dataService.open()
let tasksListView = new TaskListViev(taskList)

addTaskButton.addEventListener('click', () => {
    addTaskHandler()

})

deleteAllButton.addEventListener('click', deleteAllTasks)
showAllButton.addEventListener('click', showAllHandler)
showNotCompletedButton.addEventListener('click', showNotCompletedHandler)

window.addEventListener('load', function(){
    tasksListView.drawAll()
})

taskNameInput.addEventListener('keydown', function(e){
    if(e.code == 'Enter') addTaskHandler()
})

function addTaskHandler(){
    if(taskNameInput.value){
        let newTask = new Task(taskNameInput.value)
        dataService.add(newTask)
        tasksListView.drawAll()
        taskNameInput.value = ''
    } else {
        alert('Enter a task name')
    }
    footerDisplay()
}

function showAllHandler(){
    tasksListView.drawAll()
}

function showNotCompletedHandler(){
    tasksListView.drawNotCompleted()
}

function deleteAllTasks(){
    localStorage.clear()
    dataService.removeAllTasks()
    while (taskList.hasChildNodes()) {
        taskList.removeChild(taskList.firstChild)
    }
    footerDisplay()
}

function editTask(){
    const listItem = this.parentNode
    const editInput = listItem.querySelector('.task__edit')
    const p = listItem.querySelector('p')
    const editTaskBtn = listItem.querySelector('.task__edit-btn')
    let containsClass = listItem.classList.contains('editMode')

    if(containsClass){
        for (const item of dataService.tasks) {
            if(item.text === p.innerText){
                item.text = editInput.value
                break
            } 
        }
        dataService.save()
        p.innerText = editInput.value 
        editTaskBtn.innerText = 'Edit'
        editTaskBtn.style.background = '#e04644'
    }else{
        editInput.value = p.innerText
        editTaskBtn.innerText = 'Done'
        editTaskBtn.style.background = 'green'
    }

    listItem.classList.toggle('editMode')
}

function footerDisplay(){
    if(dataService.tasks.length == 0) {
        footer.style.display = 'none'
    } else {
        footer.style.display = 'inline-block'
    }
}

function dragStart(e){
    this.style.opacity = '0.4'
    dragSrcEl = this
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', this.innerHTML)
}

function dragEnter(e){
    this.classList.add('over')
}

function dragLeave(e){
    e.stopPropagation()
    this.classList.remove('over')
}

function dragOver(e){
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    return false
}

function dragDrop(e){
    if (dragSrcEl != this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }
    return false;
}

function dragEnd(e){
    let listItems = document.querySelectorAll('.draggable')
    listItems.forEach(item => {
        item.classList.remove('over')
    })
    this.style.opacity = '1';
    dragAndDropSave(e.target.children[0].children[1].innerText)
}

function dragAndDropSave(textElement){
    let arrayForComparing = []
    let initialArray = []
    let draggableTasks = document.querySelectorAll('p')
    for (const item of draggableTasks) {
        arrayForComparing.push(item.innerText)
    }
    for (const item of dataService.tasks) {
        initialArray.push(item.text)
    }

    [dataService.tasks[initialArray.indexOf(textElement)], dataService.tasks[arrayForComparing.indexOf(textElement)]] = [dataService.tasks[arrayForComparing.indexOf(textElement)], dataService.tasks[initialArray.indexOf(textElement)]]
    dataService.save()
    tasksListView.drawAll()
}

function addEventsDragAndDrop(element){
    element.addEventListener('dragstart', dragStart, false)
    element.addEventListener('dragenter', dragEnter, false)
    element.addEventListener('dragover', dragOver, false)
    element.addEventListener('dragleave', dragLeave, false)
    element.addEventListener('drop', dragDrop, false)
    element.addEventListener('dragend', dragEnd, false)
}