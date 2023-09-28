/// <reference path="state/project-state.ts" />
/// <reference path="models/Project.ts" />
/// <reference path="models/Drag&Drop.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="components/base.ts" />
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-item.ts" />
/// <reference path="components/project-input.ts" />

namespace App {
  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
