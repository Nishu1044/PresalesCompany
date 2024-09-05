import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { moveBlock, selectBlock, filterBlocks, addNote, addBlock, removeBlock, showPrompt, hidePrompt, setAdditionalData } from './store';

const stageOrder = ['To Do', 'In Progress', 'Done'];

const App = () => {
    const dispatcher = useDispatch();
    const { blocks, stages, filterText, selectedBlock, prompt } = useSelector(state => state);
    const [taskInput, setTaskInput] = useState('');

    const handleDragStart = (blockId) => {
        return blockId;
    };

    const handleDrop = (e, newStage) => {
        const blockId = e.dataTransfer.getData('text');
        const block = blocks.find(b => b.id === parseInt(blockId));

        if (block) {
            const allowedTransitions = {
                'To Do': ['In Progress'],
                'In Progress': ['Done', 'To Do'],
                'Done': []
            };

            if (allowedTransitions[block.stage].includes(newStage)) {
                dispatcher(showPrompt({ blockId: parseInt(blockId), newStage }));
            } else {
                alert(`Invalid transition from ${block.stage} to ${newStage}`);
            }
        }
    };

    const handleFilter = (e) => {
        dispatcher(filterBlocks(e.target.value));
    };


    const handleAddTask = () => {
        if (taskInput.trim()) {
            dispatcher(addBlock({ name: taskInput }));
            setTaskInput('');
        }
    };


    const handleRemoveTask = (blockId) => {
        dispatcher(removeBlock(blockId));
    };

    const handlePromptSubmit = () => {
        dispatcher(moveBlock({
            blockId: prompt.blockId,
            newStage: prompt.newStage,
            additionalData: prompt.additionalData
        }));
    };

    const handlePromptCancel = () => {
        dispatcher(hidePrompt());
    };

    const handleAdditionalDataChange = (e) => {
        dispatcher(setAdditionalData(e.target.value));
    };

    const filteredBlocks = blocks
        .filter(block => block.name.toLowerCase().includes(filterText))
        .sort((a, b) => {
            const stageComparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
            if (stageComparison === 0) {
                return a.id - b.id;  
            }
            return stageComparison;
        });

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f9f9f9' }}>
            <input
                type="text"
                placeholder="Search by name..."
                onChange={handleFilter}
                style={{ marginBottom: '15px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '35%' ,marginLeft:'250px'}}
            />

            <div style={{ marginBottom: '20px',marginLeft:'250px' }}>
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Name of task "
                    style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '30%' }}
                />
                <button onClick={handleAddTask} style={{ padding: '8px', backgroundColor: 'grey', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add 
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {stages.map(stage => (
                    <div
                        key={stage}
                        style={{
                            flex: 1,
                            padding: '5px',
                            backgroundColor: 'white',
                            margin: '0 20px',
                            borderRadius: '15px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            minHeight: '150px'
                        }}
                        onDrop={(e) => handleDrop(e, stage)}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <h2 style={{ textAlign: 'center' }}>{stage}</h2>
                        {filteredBlocks
                            .filter(block => block.stage === stage)
                            .map(block => (
                                <div
                                    key={block.id}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('text', handleDragStart(block.id))}
                                    onClick={() => dispatcher(selectBlock(block))}
                                    style={{
                                        padding: '10px',
                                        margin: '10px 0',
                                        backgroundColor: 'grey',
                                        color: 'black',
                                        borderRadius: '15px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background-color 0.3s',
                                    }}
                                >
                                    {block.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();  
                                            handleRemoveTask(block.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            backgroundColor: 'grey',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            width: '25px',
                                            height: '25px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        ❎
                                    </button>
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {selectedBlock && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'grey', color: 'black', borderRadius: '15px',width:'50%',fontSize:'12px',fontFamily:'fantasy',margin:'auto' }}>
                    <h3>{selectedBlock.name}</h3>
                    <p>Current Stage: {selectedBlock.stage}</p>
                    <h4>History:</h4>
                    <ul>
                        {selectedBlock.history.map((entry, index) => (
                            <li key={index}>{entry}</li>
                        ))}
                    </ul>
                </div>
            )}

            {prompt.show && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    width: '300px'
                }}>
                    <h3 style={{ margin: '0 0 5px' }}>Extra Information to Add</h3>
                    <p style={{ margin: '0 0 5px' }}>You can edit the data here :</p>
                    <input
                        type="text"
                        value={prompt.additionalData}
                        onChange={handleAdditionalDataChange}
                        placeholder="Additional data..."
                        style={{ padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '15px' }}
                    />
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button onClick={handlePromptCancel} style={{ marginRight: '10px', padding: '8px', backgroundColor: '#ccc', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={handlePromptSubmit} style={{ padding: '8px', backgroundColor: 'grey', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
