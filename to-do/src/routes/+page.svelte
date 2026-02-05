<script>
  import { onMount } from "svelte"
  import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from "$lib/api";

  /* --------------------
     Variables
  --------------------- */
  let todos = []
  let newTodo = ""
  let newPriority = "medium"
  let newDueDate = ""
  let loaded = false

  let draggedTaskId = null

  let editingTaskId = null
  let editingText = ""

  const statusOrder = ["todo", "inprogress", "done"]

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  }

  /* -----------------------------
     Local Storage
  ----------------------------- */

  onMount(async () => {
  todos = await fetchTodos();
});
  /* -----------------------------
     Derived columns
  ----------------------------- */
  $: todoTasks = sortByPriority(
    todos.filter(t => t.status === "todo")
  )

  $: inProgressTasks = sortByPriority(
    todos.filter(t => t.status === "inprogress")
  )

  $: doneTasks = sortByPriority(
    todos.filter(t => t.status === "done")
  )

  /* -----------------------------
     Functions
  ----------------------------- */
  async function addTodo() {
  if (!newTodo.trim()) return;

  await createTodo({
    title: newTodo,
    priority: newPriority,
    due_date: newDueDate,
    status: "todo"
  });

  newTodo = "";
  newDueDate = "";

  todos = await fetchTodos();
}

async function moveTask(id, newStatus) {
  await updateTodo(id, { status: newStatus });
  todos = await fetchTodos();
}

async function deleteTodoHandler(id) {
  await deleteTodo(id);
  todos = await fetchTodos();
}

function startEdit(task) {
  editingTaskId = task.id;
  editingText = task.title;
}

  function sortByPriority(tasks) {
    return [...tasks].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )
  }

  async function saveEdit(taskId) {
  if (!editingText.trim()) return;

  await updateTodo(taskId, { title: editingText.trim() });
  cancelEdit();
  todos = await fetchTodos();
}

  function cancelEdit() {
    editingTaskId = null
    editingText = ""
  }

  function handleDragStart(id) {
    draggedTaskId = id
  }

  function handleDrop(newStatus) {
    if (!draggedTaskId) return

    const task = todos.find(t => t.id === draggedTaskId)
    if (!task) return

    const fromIndex = statusOrder.indexOf(task.status)
    const toIndex = statusOrder.indexOf(newStatus)

    if (toIndex === fromIndex + 1) {
      moveTask(task.id, newStatus)
    }

    if (toIndex < fromIndex) {
      moveTask(task.id, newStatus)
    }

    draggedTaskId = null
  }

  function canDrop(fromStatus, toStatus) {
    const fromIndex = statusOrder.indexOf(fromStatus)
    const toIndex = statusOrder.indexOf(toStatus)

    if (toIndex === fromIndex + 1) return true
    if (toIndex < fromIndex) return true

    return false
  }

  function priorityColor(priority) {
    if (priority === "high") return "bg-red-500"
    if (priority === "medium") return "bg-amber-400"
    return "bg-green-500"
  }

  function isToday(dateStr) {
    if (!dateStr) return false
    const today = new Date()
    const date = new Date(dateStr)
    return today.toDateString() === date.toDateString()
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false
    const today = new Date()
    const date = new Date(dateStr)
    return date < new Date(today.toDateString())
  }

  function allowDrop(event, targetStatus) {
    if (!draggedTaskId) return

    const task = todos.find(t => t.id === draggedTaskId)
    if (!task) return

    if (canDrop(task.status, targetStatus)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
    } else {
      event.dataTransfer.dropEffect = "none"
    }
  }

</script>

<!-- =============================
     Html and Css
============================= -->
<div
  class="min-h-screen bg-cover bg-center bg-no-repeat
         flex items-center justify-center px-6 py-12"
  style="background-image: url('https://imgs.search.brave.com/pz536E8HTvuEsbuFF9XZ9ngdwyJvrC35A1c1X6LCkXE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDUwMzUx/NzcuanBn');"
>
  <div
    class="relative z-10 w-full max-w-6xl
           rounded-3xl p-7
           bg-white/70
           backdrop-blur-xl
           border border-white/40
           shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
  >
    <!-- Header -->
    <h1 class="text-3xl font-semibold text-center text-stone-800 tracking-tight">
      To-Do List
    </h1>

    <p class="text-sm text-stone-700 text-center mt-1 mb-6">
      A simple way to stay organized
    </p>

    <div class="flex gap-2 mb-4">
      <select
        bind:value={newPriority}
        class="px-3 py-2 rounded-xl border
               bg-white/80 text-slate-700
               focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <option value="high">🔴 High priority</option>
        <option value="medium">🟡 Medium priority</option>
        <option value="low">🟢 Low priority</option>
      </select>

      <input
        type="date"
        bind:value={newDueDate}
        class="px-3 py-2 rounded-xl border
               bg-white/80 text-slate-700
               focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>

    <!-- Input -->
    <div class="flex gap-2 mb-6">
      <input
        autofocus
        bind:value={newTodo}
        placeholder="What do you need to do?"
        on:keydown={(e) => e.key === "Enter" && addTodo()}
        class="flex-1 px-4 py-3 rounded-2xl
               border border-slate-200
               bg-slate-50
               focus:bg-white
               focus:outline-none focus:ring-2 focus:ring-amber-400
               transition"
      />

      <button
        on:click={addTodo}
        class="px-6 py-3 rounded-2xl
               bg-amber-500 text-slate-700 font-medium
               hover:bg-amber-600
               hover:scale-[1.02]
               active:scale-[0.98]
               transition"
      >
        Add
      </button>
    </div>

    <!-- Todo list -->
    <div class="grid grid-cols-3 gap-4 mt-6">
      <!-- TODO COLUMN -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="bg-stone-50 rounded-xl p-3"
        on:dragover={(e) => allowDrop(e, "todo")}
        on:drop={() => handleDrop("todo")}
      >
        <h2 class="font-semibold text-center mb-3">To Do</h2>

        {#each todoTasks as task (task.id)}
          <div
            draggable="true"
            on:dragstart={() => handleDragStart(task.id)}
            class="bg-white rounded-lg p-3 mb-2 shadow cursor-move"
          >
            {#if editingTaskId === task.id}
              <input
                class="w-full px-2 py-1 text-sm border rounded
                       focus:outline-none focus:ring-2 focus:ring-amber-400"
                bind:value={editingText}
                on:keydown={(e) => e.key === "Enter" && saveEdit(task.id)}
                on:blur={() => saveEdit(task.id)}
                autofocus
              />
            {:else}
              <p
                class="font-medium text-slate-800 cursor-pointer"
                on:dblclick={() => startEdit(task)}
              >
                {task.title}
              </p>
            {/if}

            <div class="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span
                class="px-2 py-0.5 rounded-full text-white"
                class:bg-red-500={task.priority === "high"}
                class:bg-amber-400={task.priority === "medium"}
                class:bg-green-500={task.priority === "low"}
              >
                {task.priority}
              </span>

              {#if task.due_date}
                <span
                  class="flex items-center gap-1"
                  class:text-red-600={isOverdue(task.due_date)}
                  class:text-amber-600={isToday(task.due_date)}
                  class:text-slate-600={!isOverdue(task.due_date) && !isToday(task.due_date)}
                >
                  {task.due_date}
                </span>
              {/if}

              <button
                class="text-xs text-red-500 hover:text-red-700 ml-auto"
                on:click={() => deleteTodoHandler(task.id)}
              >
                ✕
              </button>
            </div>

            <button
              class="text-xs text-blue-600 mt-2"
              on:click={() => moveTask(task.id, "inprogress")}
            >
              Move →
            </button>
          </div>
        {/each}
      </div>

      <!-- IN PROGRESS COLUMN -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="bg-amber-50 rounded-xl p-3"
        on:dragover={(e) => allowDrop(e, "inprogress")}
        on:drop={() => handleDrop("inprogress")}
      >
        <h2 class="font-semibold text-center mb-3">In Progress</h2>

        {#each inProgressTasks as task (task.id)}
          <div
            draggable="true"
            on:dragstart={() => handleDragStart(task.id)}
            class="bg-white rounded-lg p-3 mb-2 shadow cursor-move"
          >
            {#if editingTaskId === task.id}
              <input
                class="w-full px-2 py-1 text-sm border rounded
                       focus:outline-none focus:ring-2 focus:ring-amber-400"
                bind:value={editingText}
                on:keydown={(e) => e.key === "Enter" && saveEdit(task.id)}
                on:blur={() => saveEdit(task.id)}
                autofocus
              />
            {:else}
              <p
                class="font-medium text-slate-800 cursor-pointer"
                on:dblclick={() => startEdit(task)}
              >
                {task.title}
              </p>
            {/if}

            <div class="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span
                class="px-2 py-0.5 rounded-full text-white"
                class:bg-red-500={task.priority === "high"}
                class:bg-amber-400={task.priority === "medium"}
                class:bg-green-500={task.priority === "low"}
              >
                {task.priority}
              </span>

              {#if task.due_date}
                <span
                  class="flex items-center gap-1"
                  class:text-red-600={isOverdue(task.due_date)}
                  class:text-amber-600={isToday(task.due_date)}
                  class:text-slate-600={!isOverdue(task.due_date) && !isToday(task.due_date)}
                >
                  {task.due_date}
                </span>
              {/if}

              <button
                class="text-xs text-red-500 hover:text-red-700 ml-auto"
                on:click={() => deleteTodoHandler(task.id)}
              >
                ✕
              </button>
            </div>

            <div class="flex gap-2 mt-2 text-xs">
              <button on:click={() => moveTask(task.id, "todo")}>←</button>
              <button on:click={() => moveTask(task.id, "done")}>→</button>
            </div>
          </div>
        {/each}
      </div>

      <!-- DONE COLUMN -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="bg-green-50 rounded-xl p-3"
        on:dragover={(e) => allowDrop(e, "done")}
        on:drop={() => handleDrop("done")}
      >
        <h2 class="font-semibold text-center mb-3">Done</h2>

        {#each doneTasks as task (task.id)}
          <div
            draggable="true"
            on:dragstart={() => handleDragStart(task.id)}
            class="bg-white rounded-lg p-3 mb-2 shadow cursor-move"
          >
            {#if editingTaskId === task.id}
              <input
                class="w-full px-2 py-1 text-sm border rounded
                       focus:outline-none focus:ring-2 focus:ring-amber-400"
                bind:value={editingText}
                on:keydown={(e) => e.key === "Enter" && saveEdit(task.id)}
                on:blur={() => saveEdit(task.id)}
                autofocus
              />
            {:else}
              <p
                class="font-medium text-slate-800 cursor-pointer"
                on:dblclick={() => startEdit(task)}
              >
                {task.title}
              </p>
            {/if}

            <div class="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span
                class="px-2 py-0.5 rounded-full text-white"
                class:bg-red-500={task.priority === "high"}
                class:bg-amber-400={task.priority === "medium"}
                class:bg-green-500={task.priority === "low"}
              >
                {task.priority}
              </span>

              {#if task.due_date}
                <span
                  class="flex items-center gap-1"
                  class:text-red-600={isOverdue(task.due_date)}
                  class:text-amber-600={isToday(task.due_date)}
                  class:text-slate-600={!isOverdue(task.due_date) && !isToday(task.due_date)}
                >
                  {task.due_date}
                </span>
              {/if}

              <button
                class="text-xs text-red-500 hover:text-red-700 ml-auto"
                on:click={() => deleteTodoHandler(task.id)}
              >
                ✕
              </button>
            </div>

            <button
              class="text-xs text-gray-600 mt-2"
              on:click={() => moveTask(task.id, "inprogress")}
            >
              ← Back
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
