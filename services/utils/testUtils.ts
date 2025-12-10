
/**
 * Helper to generate consistent data-testids for E2E testing
 */
export const testId = (component: string, element?: string, id?: string) => {
  const parts = ['sentinel', component];
  if (element) parts.push(element);
  if (id) parts.push(id);
  return { 'data-testid': parts.join('-').toLowerCase() };
};

/* Usage:
   <div {...testId('Card', 'Header', '123')} /> 
   Result: data-testid="sentinel-card-header-123"
*/
