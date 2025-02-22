const deploymentSteps = [
    { text: '<span class="info">Initializing deployment pipeline...</span>', type: 'info' },
    { text: '<span class="keyword">git</span>&nbsp;<span class="keyword">checkout</span>&nbsp;main', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">Switched to branch \"main\"</span>', type: 'success' },
    { text: '<span class="keyword">git</span>&nbsp;pull&nbsp;origin&nbsp;main', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">Fast-forward merge completed</span>', type: 'success' },
    { text: '<span class="info">Installing dependencies...</span>', type: 'info' },
    { text: '<span class="keyword">npm</span>&nbsp;install', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">Added 1284 packages in 45s</span>', type: 'success' },
    { text: '<span class="info">Running unit tests...</span>', type: 'info' },
    { text: '<span class="keyword">npm</span>&nbsp;run&nbsp;test', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">PASS src/components/__tests__/App.test.js</span>', type: 'success' },
    { text: '<span class="success">PASS src/utils/__tests__/helpers.test.js</span>', type: 'success' },
    { text: '<span class="success">Test Suites: 12 passed, 12 total</span>', type: 'success' },
    { text: '<span class="info">Building production bundle...</span>', type: 'info' },
    { text: '<span class="keyword">npm</span>&nbsp;run&nbsp;build', type: 'command' },
    { text: '<span class="success">✓ Build complete. (2.5s)</span>', type: 'success' },
    { text: '<span class="info">Running security scan...</span>', type: 'info' },
    { text: '<span class="keyword">npm</span>&nbsp;audit', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">No security vulnerabilities found</span>', type: 'success' },
    { text: '<span class="info">Deploying to production server...</span>', type: 'info' },
    { text: '<span class="keyword">docker</span>&nbsp;build&nbsp;-t&nbsp;myapp:latest&nbsp;.', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">Successfully built 3f4e789abc</span>', type: 'success' },
    { text: '<span class="keyword">docker</span>&nbsp;push', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="success">Push successful: registry.example.com/myapp:latest</span>', type: 'success' },
    { text: '<span class="info">Updating Kubernetes deployment...</span>', type: 'info' },
    { text: '<span class="keyword">cd</span>&nbsp;~/projects/k8s-configs', type: 'command', path: '~/projects/continuous-integration' },
    { text: '<span class="keyword">kubectl</span>&nbsp;apply&nbsp;-f&nbsp;deployment.yaml', type: 'command', path: '~/projects/k8s-configs' },
    { text: '<span class="success">deployment.apps/myapp configured</span>', type: 'success' },
    { text: '<span class="keyword">kubectl</span>&nbsp;rollout&nbsp;status&nbsp;deployment/myapp', type: 'command', path: '~/projects/k8s-configs' },
    { text: '<span class="success">deployment \"myapp\" successfully rolled out</span>', type: 'success' },
    { text: '<span class="keyword">cd</span>&nbsp;~/projects/continuous-integration', type: 'command', path: '~/projects/k8s-configs' },
    { text: '<span class="success">✨ Deployment completed successfully! ✨</span>', type: 'success' }
];


        const terminal = document.getElementById('terminalContent');
        let currentLine = 0;
        let baseDelay = 100;

        function addLine() {
            if (currentLine >= deploymentSteps.length) {
                setTimeout(() => {
                    terminal.innerHTML = '';
                    currentLine = 0;
                    addLine();
                }, 5000);
                return;
            }

            const line = document.createElement('div');
            line.className = 'code-line';
            
            const step = deploymentSteps[currentLine];
            
            // Create a more realistic prompt with username, hostname and directory
            const promptText = step.type === 'command' 
                ? '<span class="user">root</span><span class="at">@</span><span class="host">deployment-server</span>:<span class="directory">' + (step.path || '~') + '</span><span class="prompt-char">#</span>' 
                : '<span class="system-prompt">></span>';
                
            line.innerHTML = `<span class="prompt">${promptText}</span> ${step.text}`;
            
            let delay = baseDelay;
            if (step.type === 'command') {
                delay = 1000;
            } else if (step.type === 'success') {
                delay = 500;
            } else if (step.type === 'info') {
                delay = 800;
            }

            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            currentLine++;

            setTimeout(addLine, delay);
        }

        // Start the animation
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addLine, 500);
        });