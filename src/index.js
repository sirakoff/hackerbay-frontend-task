import ReactDOM from 'react-dom';
import React from 'react';

const Square = ({square, current, hasEnemy, index}) => {

    return (
        <div style={{
            border: '1px solid',
            float: 'left',
            marginTop: '-1px',
            marginRight: '-1px',
            width: 30,
            height: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }} key={index}>
            {(square.x === current.x && square.y === current.y) ? <div style={{
                backgroundColor: 'red',
                width: 20,
                height: 20,
                borderRadius: '999rem'
            }}></div> : null}
            {(hasEnemy) ? <div style={{
                backgroundColor: 'green',
                width: 20,
                height: 20,
                borderRadius: '999rem'
            }}></div> : null}
        </div>
    );

}

class Dimensions extends React.Component{

    constructor(props) {

        super(props);

        this.state = {
            width: 5,
            height: 5
        }

        this.submit = this.submit.bind(this);

    }

    submit() {

        let {width, height} = this.state;

        this.props.onSubmit({width, height});

        this.setState({
            width: 0,
            height: 0
        });
    }

    render() {

        let {width, height} = this.state;

        return (
            <div style={{
                margin: '0 auto',
                width: 400
            }}>
                <p>Kindly enter the dimensions of your board game.</p>
                <input type="number" defaultValue={`${width}`} onChange={(e) => {

                    this.setState({
                        width: parseInt(e.target.value)
                    });

                }} placeholder="width"/>
                X
                <input type="number" value={`${height}`} onChange={(e) => {

                    this.setState({
                        height: parseInt(e.target.value)
                    });

                }} placeholder="height"/>
                <br/>
                <button style={{
                    marginTop: 10
                }} onClick={this.submit}>Start game</button>
            </div>
        )

    }

}

class Board extends React.Component{

    constructor(props) {

        super(props);

        const {squares, dimensions} = props;

        this.state = {
            squares: squares,
            dimensions: dimensions,
            steps: 0,
            squaresLength: squares.length,
            // enemiesIndexed: {},
            ...this.computeEnemies(dimensions, squares),
        };

        this.reset = this.reset.bind(this);
        this.renderSquares = this.renderSquares.bind(this);
        this.keyDown = this.keyDown.bind(this);
        

    }

    computeEnemies(dimensions, squares) {

        var totalSquares = dimensions.width * dimensions.height;
        var totalEnemies = (dimensions.width + dimensions.height) / 2;
        var enemies = [];
        var enemiesMapped = {};
        var enemiesIndexed = {};
        const current = {
            x: Math.ceil(dimensions.height / 2),
            y: Math.ceil(dimensions.width / 2)
        };

        for (let i = 0; i < totalEnemies; i++) {

            var enemy = Math.floor(Math.random() * (totalSquares - 1)) + 1;
            var foundEnemy = squares[enemy];

            while (((foundEnemy.x === current.x) && (foundEnemy.y === current.y)) || (enemies.indexOf(enemy) > -1)) {

                enemy = Math.floor(Math.random() * (totalSquares - 1)) + 1;
                foundEnemy = squares[enemy];

            }

            enemies.push(enemy);

            enemiesMapped[`${foundEnemy.x},${foundEnemy.y}`] = enemy;

            
        }

        for (let i = 0; i < enemies.length; i++) {
            
            const enemy = enemies[i];

            enemiesIndexed[enemy] = true;
            
        }

        return {
            current,
            enemiesMapped,
            enemies,
            enemiesIndexed
        }

    }

    keyDown(e) {

        var key = 'which' in e ? e.which : e.keyCode;
        var _this = this;
        let {dimensions} = _this.props;


        let {current, enemiesMapped, enemiesIndexed, enemies, steps} = _this.state;

        if (enemies.length === 0) {

            _this.setState({
                steps,
                // current,
                enemies,
                enemiesMapped
            });

            setTimeout(() => alert(`You finished the game with ${steps} steps.`))

            return;

        } else {

            steps++;

            const IS_LEFT = key === 37;
            const IS_UP = key === 38;
            const IS_RIGHT = key === 39;
            const IS_DOWN = key === 40;
    
            if (IS_LEFT) {
    
                if (current.y === 1) return;
    
                current.y--;
    
    
            }
    
            if (IS_RIGHT) {
    
                if (current.y === dimensions.width) return;
    
                current.y++;
    
            }
    
            if (IS_UP) {
    
                if (current.x === 1) return;
    
                current.x--;
    
            }
    
            if (IS_DOWN) {
    
                if (current.x === dimensions.height) return;
    
                current.x++;
    
            }
    
            let detectedEnemy = enemiesMapped[`${current.x},${current.y}`];
    
            if (detectedEnemy) {
    
                var index = enemies.indexOf(detectedEnemy);
    
                if (index > -1) {
                    
                    _this.state.enemies.splice(index, 1);
    
                    delete enemiesMapped[`${current.x},${current.y}`];
                    delete enemiesIndexed[detectedEnemy];
    
                }
    
            }

            _this.setState({
                steps,
                current,
                enemies,
                enemiesMapped
            });

        }


    }

    componentWillUnmount() {

        document.removeEventListener('keydown', this.keyDown, false);

    }

    componentWillMount() {

        document.addEventListener('keydown', this.keyDown, false);

    }

    reset() {

        let {dimensions, squares} = this.state;

        this.setState({
            ...this.computeEnemies(dimensions, squares),
            steps: 0
        });

    }

    renderSquares() {

        let {squares, current, enemiesIndexed, squaresLength} = this.state;
        let board = [];

        for (let index = 0; index < squaresLength; index++) {
            
            const square = squares[index];

            board.push(<Square square={square} hasEnemy={enemiesIndexed[index]} current={current} index={index} key={index}  />);
            
        }

        return board;
    }

    render() {

        let _this = this;
        let {dimensions, steps} = _this.state;

        return (
            <div>

                <div style={{
                    margin: '0 auto',
                    width: 32 * dimensions.width,
                    height: 32 * dimensions.height
                }}>
                    {this.renderSquares()}
                </div>

                <div style={{
                    textAlign: 'center'
                }}>
                    <p>{steps} Steps</p>
                    <button onClick={this.reset}>Reset game</button>
                    <button onClick={() => {

                        this.props.parent.setState({
                            init: false
                        });

                    }}>Restart game</button>
                </div>

            </div>
        );

    }
    

}

class MazeGame extends React.Component{

    constructor(props) {

        super(props);

        this.state = {
            init: false,
            squares: [],
            dimensions:{}
        };

    }

    render() {

        let {squares, init, dimensions} = this.state;

        // console.log(init);

        return (init) ? <Board parent={this} dimensions={dimensions} squares={squares}/>: <Dimensions onSubmit={(dimensions) => {

            let {width, height} = dimensions;
            let squares = [];

            for (let x = 0; x < height; x++) {
                for (let y = 0; y < width; y++) {
                    squares.push({
                        x: x+1,
                        y: y+1
                    });
                }
            }

            // console.log(squares);

            this.setState({squares, dimensions, init: true});

        }} />

    }

}

ReactDOM.render(
    <MazeGame />,
    document.getElementById('root')
);