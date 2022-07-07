const PerfTool = {
	container: document.createElement("perftool"),
	
	widgets: {
		FPS: {
			active: true,
			
			get FPS () {
				const list = PerfTool.widgets.FPS._datas.list;
				
				let FPS = 0;
				
				for (let x = 0; x < list.length; ++x) {
					FPS += list[x];
				}
				
				return FPS / list.length;
			},
			
			get precision () {
				return PerfTool.widgets.FPS._datas.precision;
			},
			
			set precision (value) {
				if (typeof value == "number") {
					if (value <= 0) {
						throw "FPS precision must be greater than 0";
					} else if (value > 1) {
						throw "FPS precision must be less than or equal to 1";
					} else {
						return PerfTool.widgets.FPS._datas.precision = value;
					}
				} else {
					throw "FPS precision must be a number";
				}
			},
			
			_datas: {
				previousTimestamp: 0,
				precision: 100,
				list: [],
				
				update: (self) => {
					const timestamp = performance.now();
					const diff = timestamp - self._datas.previousTimestamp;
					
					const FPS = (1 / diff) * 1000;
					
					if (FPS <= 60) {
						self._datas.list.unshift(FPS);
					}
					
					if (self._datas.list.length > self._datas.precision) {
						self._datas.list.pop();
					}
					
					self._datas.previousTimestamp = timestamp;
				},
				
				display: (self,container) => {
					container.innerHTML = `${self.FPS.toFixed(1)} FPS`;
					container.style = `color: rgb(${(self.FPS > 30 ? Math.round(255 - ((self.FPS - 30)) / 30 * 255) : 255)},${(self.FPS < 30 ? Math.round(self.FPS / 30 * 255) : 255)},0); text-align: center`;
				}
			}
		},
		
		FPSGraph: {
			active: true,
			
			_datas: {
				previousTimestamp: 0,
				precision: 100,
				list: [],
				
				update: (self) => {
					const timestamp = performance.now();
					const diff = timestamp - self._datas.previousTimestamp;
					
					const FPS = (1 / diff) * 1000;
					
					if (FPS <= 60) {
						self._datas.list.unshift(FPS);
					}
					
					if (self._datas.list.length > self._datas.precision) {
						self._datas.list.pop();
					}
					
					self._datas.previousTimestamp = timestamp;
				},
				
				display: (self,container) => {
					const canvas = document.createElement("canvas");
					canvas.setAttribute("moz-opaque","true");
					
					const width = Number(getComputedStyle(PerfTool.container).width.replace("px",""));
					const height = width / 2;
					
					canvas.width = width;
					canvas.height = height;
					
					canvas.style = `
					display: block;
					
					background: #000`;
					
					const ctx = canvas.getContext("2d");
					
					ctx.clearRect(0,0,width,height);
					
					const maxLength = self._datas.precision;
					const length = self._datas.list.length;
					
					for (let x = 0; x < length; ++x) {
						const v = self._datas.list[x];
						
						ctx.fillStyle = `rgb(${(v > 30 ? Math.round(255 - ((v - 30)) / 30 * 255) : 255)},${(v < 30 ? Math.round(v / 30 * 255) : 255)},0)`;
						ctx.fillRect((1 - x / maxLength) * width,height - v / 60 * height,v / width,v / 60 * height);
					}
					
					container.append(canvas);
				}
			}
		}
	},
	
	get active () {
		return PerfTool.updating;
	},
	
	set active (value) {
		if (value) {
			PerfTool.updating = true;
			requestAnimationFrame(() => PerfTool._update());
		} else {
			PerfTool.updating = false;
		}
	},
	
	_update: () => {
		if (PerfTool.updating) {
			PerfTool.container.innerHTML = "";
			
			for (let name in PerfTool.widgets) {
				const Widget = PerfTool.widgets[name];
				
				if (Widget.active) {
					const container = document.createElement("div");
					
					Widget._datas.update(Widget);
					
					Widget._datas.display(Widget,container);
					
					PerfTool.container.append(container);
				}
			}
			
			requestAnimationFrame(() => PerfTool._update());
		}
	}
};

PerfTool.container.style = `
display: block;

position: fixed;
top: 0;
left: 0;

width: 5rem;

background: black;

color: white;
font-family: Menlo;
font-size: 10px;

margin: 0;
padding: 0.2rem`;
