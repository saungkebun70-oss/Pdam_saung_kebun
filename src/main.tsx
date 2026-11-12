import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Proteksi terhadap mutasi DOM eksternal (seperti Google Chrome Translate / ekstensi browser)
// yang sering menyebabkan error "Failed to execute 'removeChild' on 'Node'" di React.
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode && this.contains(child.parentNode)) {
        try {
          const wrapper = child.parentNode;
          wrapper.removeChild(child);
          if (
            wrapper.nodeName === 'FONT' &&
            wrapper.childNodes.length === 0 &&
            wrapper.parentNode === this
          ) {
            originalRemoveChild.apply(this, [wrapper]);
          }
        } catch {
          // Abaikan jika node sudah terlepas
        }
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      let refParent: Node | null = referenceNode.parentNode;
      while (refParent && refParent.parentNode !== this) {
        refParent = refParent.parentNode;
      }
      if (refParent && refParent.parentNode === this) {
        return originalInsertBefore.apply(this, [newNode, refParent]) as T;
      }
      return originalInsertBefore.apply(this, [newNode, null]) as T;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
